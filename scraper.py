from bs4 import BeautifulSoup
import csv
import requests

url = 'https://www.britannica.com/topic/United-States-Presidential-Election-Results-1788863'
page = requests.get(url)
soup = BeautifulSoup(page.content,  'html.parser')
file_name = 'elections.csv'

this_section = soup.find('section', {'id':'ref1'})
election_table = this_section.find('table')

years = election_table.tbody.find_all('tr', {'class': 'has-rs'})


rows = []
election_year = 'NULL'
start_year = False

for tr in election_table.tbody.find_all('tr'):
    start_year = False
    if tr.has_attr('class'):
        start_year = True
        if int(tr.td.p.text.strip()) >= 1910:
            election_year = tr.td.p.text.strip()
    if election_year != 'NULL':
     rows.append([election_year, tr, start_year])


database = []
database.append(["year", "candidate", "party", "electoral votes", "popular votes", "popular vote percentage",
                 "first name", "last name", "middle initial"])

for row in rows:
    offset = 0
    year = row[0]
    cells = row[1].find_all('td')
    if row[2]: #if the first row for a year
        offset = 1
    candidate = cells[0+offset].text.strip()
    last_name = candidate.split(" ")[-1].strip()
    first_name = candidate.split(" ")[0].strip()
    MI = "" if len(candidate.split(" ")) <3 else candidate.split(" ")[1].strip()

    party = cells[1+offset].text.strip()
    ev = cells[2+offset].text.strip() if cells[2+offset].text.strip() !="" else 0
    pop_vote = cells[3+offset].text.replace(",", "").strip()
    pop_percent = cells[4+offset].text.strip()


    database.append([year, candidate, party, ev, pop_vote, pop_percent, first_name, last_name, MI])

with open('data/elections.csv', 'w', newline='') as csvfile:
    spamwriter = csv.writer(csvfile, delimiter=',',
                            quotechar='|', quoting=csv.QUOTE_MINIMAL)
    for row in database:
        spamwriter.writerow(row)
