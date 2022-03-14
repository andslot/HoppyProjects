import random
import itertools as it
data = [line.strip().lower() for line in open('ordliste.txt', 'r')]

wordsWithI = []
for word in data:
    if 'i' in word:
        wordsWithI.append(word)
print(len(data), len(wordsWithI))

sortedWords = []
firstI = []
secondI = []
thirdI = []
forthI = []
fithI = []
sixthI = []
seventhI = []
eighthI = []
ninethI = []
tenthI = []

for word in wordsWithI:
    if word.find('i') == 0:
        firstI.append(word)
    if word.find('i') == 1:
        secondI.append(word)
    if word.find('i') == 2:
        thirdI.append(word)
    if word.find('i') == 3:
        forthI.append(word)
    if word.find('i') == 4:
        fithI.append(word)
    if word.find('i') == 5:
        sixthI.append(word)
    if word.find('i') == 6:
        seventhI.append(word)
    if word.find('i') == 7:
        eighthI.append(word)
    if word.find('i') == 8:
        ninethI.append(word)
    if word.find('i') == 9:
        tenthI.append(word)

random.shuffle(firstI)
random.shuffle(secondI)
random.shuffle(thirdI)
random.shuffle(forthI)
random.shuffle(fithI)
random.shuffle(sixthI)
random.shuffle(seventhI)
random.shuffle(eighthI)
random.shuffle(ninethI)
random.shuffle(tenthI)

f = open('wordsWithOnlyI.txt', 'w')

f.write('I som første bogstav: \n')
f.write("\n".join(it.islice(firstI, 50)))
f.write("\n \n")
f.write('I som andet bogstav: \n')
f.write("\n".join(it.islice(secondI, 50)))
f.write("\n \n")
f.write('I som tredje bogstav: \n')
f.write("\n".join(it.islice(thirdI, 50)))
f.write("\n \n")
f.write('I som fjerde bogstav: \n')
f.write("\n".join(it.islice(forthI, 50)))
f.write("\n \n")
f.write('I som femte bogstav: \n')
f.write("\n".join(it.islice(fithI, 50)))
f.write("\n \n")
f.write('I som sjette bogstav: \n')
f.write("\n".join(it.islice(sixthI, 50)))
f.write("\n \n")
f.write('I som syvende bogstav: \n')
f.write("\n".join(it.islice(seventhI, 50)))
f.write("\n \n")
f.write('I som ottende bogstav: \n')
f.write("\n".join(it.islice(eighthI, 50)))
f.write("\n \n")
f.write('I som niene bogstav: \n')
f.write("\n".join(it.islice(ninethI, 50)))
f.write("\n \n")
f.write('I som tiende bogstav: \n')
f.write("\n".join(it.islice(tenthI, 50)))
f.write("\n \n")

f.close()
