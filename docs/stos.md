# Metodologia:

Projekt jest/będzie złożony z kilku kontenerów docker'a, w celu ograniczenia 
problemów wynikających z różnych środowisk developerskich (Windows, Ubuntu,
Arch, MacOS) jak i produkcyjnych (Arch). Tworzenie rozwiązań kontenerowych oraz
użycie platform takich jak *docker hub* pozwala na łatwe wprowadzenie systemu 
`ci/cd` w projekcie za pomocą narzędzia `github actions`. Wybór ten jest 
argumentowany dotychczasowymi doświadczeniami w 
[projektach uczelnianych](https://pbl.grzegorzkoperwas.site/) jak 
[i własnych.](https://clip.grzegorzkoperwas.site)

## Języki programowania i frameworki

Projekt będzie głównie pisany w językach `typescript` oraz `python`. Pierwszy 
z nich został wybrany ze względu na zapewnianie systemu typu i dokumentacji 
z niego wynikającej, drugi został wybrany ze względu na doświadczenie ekipy 
programistycznej w tworzeniu podobnych rozwiązań.

Wybór frameworka frontendowego został głównie podyktowany ciekawością. Mimo iż
stan gotowości narzędzi wokół `solid.js` pozostawia trochę do życzenia, oraz 
nikt w zespole nie ma w nim doświadczenia, to perspektywa rozwiązania wielu 
problemów codziennego chleba **reactowego**, z którym mamy do czynienia w pracy, 
była zachęcająca.

Wybór frameworka backendowego miał kompletnie inny charakter, *FastAPI* jest 
sprawdzonym dla nas rozwiązaniem, które dobrze wspiera programistów w ich pracy. 
W porównaniu z konkurencją, fastapi generuje automatycznie dokumentację 
`openapi`, zachowując prostotę *flaska*. Jednocześnie jest w stanie robić to 
bez obciążenia boilerplatem z którym boryka się *django*, wraz ze swoim `MVC`.

## Baza danych

Nasz wybór bazy danych jest bardzo ryzykowny. *SurrealDB* zawiera bardzo 
atrakcyjny mix tradycyjnego prawie że `SQL` oraz funkcjonalności grafowych. 
Pozwala nam to uniknąć problemów z *joinami* w asynchronicznym środowisku, 
jakie posiada tradycyjna baza relacyjna z typowym ORM `sqlalchemy`.

SurrealDB pozwala na łatwe przechowywanie danych bez określonej `schemy`, co 
jest trudne w tradycyjnych bazach relacyjnych, na przykład w wcześniej używanym 
przez nas `postgreSQL`.

Dużym zagrożeniem, z którym musieliśmy już walczyć jest słaba jakość lub nie 
istnienie narzędzi dla surrealDB. Klient pythonowy wymagał już zgłaszania 
błędów oraz poprawek do maintainerów, a pisanie własnego ORM bywa ciekawe. 
Miejmy nadzieje że narzędzia które już tworzymy pozwolą innym na rozwiązanie 
ich problemów, gdyż zamierzamy wyodrębnić nasz `surreal_orm` kiedy będzie 
gotowy jako osobny projekt. 
