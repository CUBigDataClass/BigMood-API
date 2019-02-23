import json
import csv
class DAO():
    def get_woeid(self, data):
        woeid_dict = {}
        with open(data) as csv_file:
            ids = csv.reader(csv_file, delimiter=",")
        for line in ids:
            if line[1] in woeid_dict:
                pass
            woeid_dict[line[1]] = line[2]
            print(woeid_dict)

            

if __name__ == "__main__":
    file = "usa_woeid.csv"
    fect_data = DAO()
    fect_data.get_woeid(file)




