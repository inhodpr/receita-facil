from scripts import user, storage
from google.cloud import datastore

class DatastoreUserStorage(storage.UserStorage):
    def __init__(self):
        self._datastore_client = datastore.Client(project='hellodpiresworld')

    def find_user_by_email(self, email: str) -> user.User:
        key = self._datastore_client.key('user', email)
        entity = self._datastore_client.get(key=key)
        if not entity:
            return None
        return user.User(email, entity['password'])
