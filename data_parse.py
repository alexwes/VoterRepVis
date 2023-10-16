import csv

db = []
db.append(["state", "region", "year", "pop", "pop_change", "pop_density", "pop_density_rank", "num_reps", "num_reps_change", "pop_per_rep"])

with open('data/apportionment.csv', newline='') as csvfile:
    spamreader = csv.reader(csvfile, delimiter=',', quotechar='"')
    next(spamreader)
    for row in spamreader:
        state = row[0]
        region = row[1]
        year = row[2]
        pop = row[3].replace(',', '')
        pop_change = row[4]
        pop_density = "" if row[5] == "" else row[5].replace(',', '')
        pop_density_rank = row[6]
        num_reps = row[7]
        num_reps_change = row[8]
        pop_per_rep = "" if row[9] == "" else row[9].replace(',', '')
        print(pop_density)
        print(type(num_reps_change))
        if(state != "Puerto Rico"):
            db.append([state, region, year, pop, pop_change, pop_density, pop_density_rank, num_reps, num_reps_change, pop_per_rep])

with open('data/census_clean.csv', 'w', newline='') as csvfile:
    spamwriter = csv.writer(csvfile, delimiter=',',
                            quotechar='|', quoting=csv.QUOTE_MINIMAL)

    for row in db:
        spamwriter.writerow(row)



