"""Provider snapshots only: never restore over or delete the source branch.
No connection URI, password, or row data is printed or written to disk.
"""
import argparse
import datetime as dt
import json
import os
import time
import urllib.request
import urllib.parse


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--action', choices=['backup', 'restore-check'], default='backup')
    parser.add_argument('--source', required=True)
    args = parser.parse_args()
    project = os.environ['NEON_PROJECT_ID']
    production = os.environ['NEON_PRODUCTION_BRANCH_ID']
    token = os.environ['NEON_API_KEY']

    def api(path, method='GET', data=None):
        req = urllib.request.Request(
            f'https://console.neon.tech/api/v2/projects/{project}{path}',
            data=json.dumps(data).encode() if data is not None else None,
            headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'},
            method=method,
        )
        with urllib.request.urlopen(req, timeout=60) as response:
            return json.load(response)

    now = dt.datetime.now(dt.timezone.utc)
    source = api(f'/branches/{args.source}')['branch']
    if args.action == 'backup':
        if source['id'] != production:
            raise ValueError('Sauvegarde automatique limitée à la branche Production configurée')
        prefix = 'backup-auto-'
    else:
        if source['id'] == production or not source['name'].startswith(('backup-auto-', 'backup-before-')):
            raise ValueError('Restauration de test limitée à une sauvegarde identifiée')
        prefix = 'restore-check-'
    branch = api('/branches', 'POST', {
        'branch': {'name': prefix + now.strftime('%Y%m%d-%H%M%S'), 'parent_id': source['id']},
        'endpoints': [{'type': 'read_write'}],
    })['branch']
    for _ in range(60):
        if api(f'/branches/{branch["id"]}')['branch'].get('current_state') == 'ready':
            break
        time.sleep(1)
    else:
        raise TimeoutError('La nouvelle branche ne devient pas prête ; aucune sauvegarde existante supprimée')
    if args.action == 'restore-check':
        def fingerprint(branch_id):
            query = urllib.parse.urlencode({'branch_id': branch_id, 'database_name': 'neondb', 'role_name': 'neondb_owner', 'pooled': 'false'})
            uri = api('/connection_uri?' + query)['uri']
            host = urllib.parse.urlparse(uri).hostname
            queries = []
            for table, key in [('Product','id'), ('Order','id'), ('OrderItem','id'), ('StockReservation','id'), ('WebhookEvent','eventId'), ('EmailDelivery','id')]:
                statement = f'''SELECT count(*) AS count, md5(COALESCE(string_agg(to_jsonb(t)::text, ',' ORDER BY "{key}"), '')) AS fingerprint FROM "{table}" t'''
                queries.append({'query': statement, 'params': []})
            req = urllib.request.Request('https://' + host + '/sql', data=json.dumps({'queries': queries}).encode(), headers={'Neon-Connection-String': uri, 'Content-Type': 'application/json', 'Neon-Batch-Isolation-Level': 'Serializable'})
            with urllib.request.urlopen(req, timeout=60) as response:
                return [result['rows'] for result in json.load(response)['results']]
        if fingerprint(source['id']) != fingerprint(branch['id']):
            raise ValueError('Les données restaurées diffèrent du snapshot : vérification manuelle requise')
        print('Empreintes de six tables métier identiques au snapshot source.')
    print(json.dumps({'action': args.action, 'branch_id': branch['id'], 'name': branch['name']}))
    # Retain seven days of this workflow's daily snapshots; preserve every manual/pre-release backup.
    # Verify a replacement exists before removing any expired auto snapshot.
    if args.action == 'backup':
        for old in api('/branches')['branches']:
            created = dt.datetime.fromisoformat(old['created_at'].replace('Z', '+00:00'))
            if old['id'] not in [production, branch['id']] and old['parent_id'] == production and old['name'].startswith('backup-auto-') and created < now - dt.timedelta(days=7):
                # Never delete a backup that is the parent of a restore or another retained branch.
                all_branches = api('/branches')['branches']
                if not any(child.get('parent_id') == old['id'] for child in all_branches):
                    api(f'/branches/{old["id"]}', 'DELETE')
                    print('Ancienne sauvegarde automatique expirée supprimée:', old['id'])


if __name__ == '__main__':
    main()
