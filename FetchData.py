import json

class DAO():
    def get_woeid(self, data):
        with open(data) as json_file:
            ids = json.load(json_file)
        for usa in ids["country" == "United States"]:
            print(usa["name"], usa["woeid"])
        

if __name__ == "__main__":
    file = "/woeid.json"
    fect_data = DAO()
    fect_data.get_woeid(file)




