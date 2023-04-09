#create a two variables adhar and phone , get the details and convert those details to a key value pair, and then into a json file and save it in a folder

import json
def details():
    adhar = input("enter adhar number")
    phone = input("enter phone number")
    details = {adhar:phone}
    with open("details.json", "w") as f:
        json.dump(details, f)
details()