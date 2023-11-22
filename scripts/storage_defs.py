from scripts import drugs_datastore, on_disk_support_icons_storage, appengine_datastore_footnotes, storage, user_storage


class Storage:
    def __init__(self):
        self._drugs = drugs_datastore.DrugsDatastore()
        # self._drugs = on_disk_drugs_storage.OnDiskDrugStorage()
        self._footnotes = appengine_datastore_footnotes.AppEngineDataStoreFootnotes()
        # self._footnotes = jinja_footnotes.JinjaFootnotesStorage()
        self._support_icons = on_disk_support_icons_storage.OnDiskSupportIconsStorage()
        self._user = user_storage.DatastoreUserStorage()

    def drugs(self) -> storage.DrugsStorage:
        return self._drugs

    def footnotes(self) -> storage.FootnotesStorage:
        return self._footnotes

    def support_icons(self) -> storage.SupportIconsStorage:
        return self._support_icons
    
    def user(self) -> storage.UserStorage:
        return self._user