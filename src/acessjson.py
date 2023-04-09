#write a program to read adhar from the json file and print it
import json
def printdetails(name): 
    with open("details.json", "r") as f:
        data = json.load(f)
    print(data[name])
    
printdetails("360611993348")