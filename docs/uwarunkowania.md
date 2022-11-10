---
title: "Analiza tematyki projektu oraz uwarunkowań jego realizacji"
author:
 - "Grzegorz Koperwas"
 - "Kamil Kowalczyk"
 - "Artur Iwański"
 - "Wojciech Jasiewicz"
institute: "Politechnika Śląska"
topic: "InżOp - Kronikarz"
theme: "Copenhagen"
colortheme: "whale"
fontsize: 11pt
urlcolor: red
linkstyle: bold
aspectratio: 169
lang: pl-PL
section-titles: false
---

# Analiza innych rozwiązań na rynku:

Postanowiliśmy przeanalizować trzy inne rozwiązanie, które podchodzą do problemu 
drzew genealogicznych w trzy różne sposoby.

## [Mackiev Family Tree Maker 2019](https://www.mackiev.com/ftm/)

::: columns

:::: column

**Family Tree Maker 2019** jest klasyczną aplikacją natywną. Sprawia wrażenie 
produktu profesjonalnego, nie skierowanego do małych rodzinnych zastosowań, 
wydaje się bardziej skierowana dla osób, dla których genealogia jest zawodem.

::::

:::: column

![Grafika promocyjna FTM2019](https://www.mackiev.com/images/ftm/product_page/intro_1x.png?v3)

::::

:::

### Zalety oraz wady

#### Zalety:
  - Wbudowane narzędzia do edycji zdjęć
  - Integracja z serwisem Ancestry.com
  - Wsparcie dla innych danych o przodkach, takie jak wizualizacja miejsc zamieszkania na mapie.
  - Wizualizacja pochodzenia kolorami.
  - Dokumentacja
  - Aplikacja klasyczna z wsparciem dla przechowywania niektórych wybranych danych w chmurze.

#### Wady:
  - Duży koszt (80 funtów → 439zł!)
  - Brak wsparcia dla systemu GNU/Linux

## [Lucidchart](https://www.lucidchart.com/pages/examples/family-tree-generator)

::: columns

:::: column

**Lucidchart** jest produktem skierowanym tylko i wyłącznie dla małych drzew 
rodzinnych, nie zawiera jakiejkolwiek funkcjonalności mającej na celu działanie 
na danych, skupia się wyłącznie na ich prezentacji. 

**Lucidchart** jest bardziej klonem *graph.io*, aniżeli pełnoprawną aplikacją do 
tworzenia drzew genealogicznych.

::::

:::: column

![Interfejs lucidchart](https://cdn-cashy-static-assets.lucidchart.com/marketing/pages/consideration-page/Tree-Chart/_new_family-tree-chart-track-history.png){width=250px}

::::

:::

### Zalety oraz wady

#### Zalety:

  - Oferta z darmowym planem.
  - Aplikacja z wsparciem dla wielu użytkowników
  - Różne wzorce

#### Wady:

  - Nie oferuje nic poza edytorem grafów.
  - Ograniczone miejsce dla przechowywania zdjęć.
  - Brak jakiegokolwiek sposobu na interakcje z danymi zawartymi w drzewie rodzinnym.

## [Ancestry.com](https://www.ancestry.com/c/family-tree)

::: columns

:::: column

**Ancestry.com** jest produktem głównie skierowanym dla klientów serwisu badań 
genetycznych swojego producenta. Cechą szczególną tego rozwiązania jest możliwość 
wyszukiwania danych w wielu najróżniejszych źródłach.

::::

:::: column

![Interfejs Ancestry.com](./docs/assets/ancestry.png)

::::

:::

### Zalety oraz wady

#### Zalety:

  - Dostęp do danych z testów genetycznych oraz innych źródeł (manifesty statków z Ellis Island, stare książki telefoniczne itp.)
  - Rozwiązanie z darmowym planem.

#### Wady:

  - Dodanie własnych danych sprawia że są one dostępne dla innych.
  - Prosty interfejs nie pozwala na tworzenie ładnych drzew.
  - Dane są skupione głównie na stanach zjednoczonych

## Wnioski:

Postanowiliśmy stworzyć rozwiązanie, które jest skierowane dla osób chcących 
udokumentować historię własnej rodziny jako hobby, lecz nie będących zawodowymi
historykami.

Z tego powodu nasza aplikacja będzie się skupiać na danych, zamiast na wyglądzie.
Szczególnie zamierzamy się skupić na możliwości łatwej konfiguracji aplikacji, tak 
by użytkownik nie był przerażony ilością dostępnych opcji, ale by mógł mieć wszystkie 
pola jakich zapragnie.

# Badania literaturowe:

Nasze badania skupiały się na określaniu trudności przedsięwzięcia oraz na tym 
jakiej technologii będziemy potrzebować do zrealizowania naszych celów 
oraz określeniu co jesteśmy w stanie stworzyć.

Z tego powodu postanowiliśmy zbadać jak skomplikowane byłoby rysowanie własnych 
drzew oraz jakiej technologii potrzebujemy do modelowania różnych danych oraz 
relacji między nimi.

## Badania o technologii:


W wyborze technologii kierowaliśmy się filmikami z kanału [fireship.io](https://www.youtube.com/channel/UCsBjURrPoezykLs9EqgamOA).
W wolnym czasie śledzimy ten kanał w celu śledzenia informacji o nowych 
technologiach. Pozwoliło nam to dobrać ciekawą bazę danych pozwalającą nam 
modelować zarówno skomplikowane relacje jak i arbitralne dane.

- Dokumentacja `SurrealDB`
- Fireship.io - filmiki z najnowszymi frameworkami

### Inne książki 

W projekcie korzystamy z zasad przedstawionych w następujących książkach, 
traktujemy je jako wytyczne.

- Kubernetes - Tworzenie systemów rozproszonych, Kelsey Hightower, Brendan Burns, Joe Beda.
- The Art of Clean Code - Christian Mayer

## Badania o możliwościach.

W celu określenia czy jesteśmy w stanie sami zaimplementować drzewa genealogiczne
z arbitralnymi (również kazirodczymi) relacjami, zapoznaliśmy się z publikacjami 
o algorytmach stosowanych w programie `graphviz`.

- [Graph Drawing by Stress Majorization, Emden R. Gansner, Yehuda Koren and Stephen North](https://www.graphviz.org/documentation/GKN04.pdf)
- [A Technique for Drawing Directed Graphs, Emden R. Gansner, Eleftherios Koutsofios, Stephen C. North, Kiem-Phong Vo](https://www.graphviz.org/documentation/TSE93.pdf)

Po zapoznaniu się z kompleksowością problemu, postanowiliśmy nie implementować 
własnego algorytmu rysowania grafu.

# Uwarunkowania prawne oraz organizacyjne:

Projekt, jak każdy projekt studencki, charakteryzuje się niskim budżetem dostępnym
na zakup licencji. Z tego powodu nasz projekt będzie polegał na otwartych 
rozwiązaniach. 

#### Licencjonowanie

Postanowiliśmy również udostępniać nasz kod na licencji `GPL3`,
gdyż nie mamy na razie żadnych planów na komercjalizacje projektu oraz chcemy 
by inni studenci nie mogli tak bezpośrednio kopiować naszego kodu, na co pozwala 
licencja `MIT`.

#### Infrastruktura

Nasz projekt będzie hostowany na platformie *grzeshosting*, znanej również jako 
,,serwer w piwnicy''. Jest to rozwiązanie nie generujące dodatkowych kosztów dla 
nas.




# Podsumowanie:

Analizując nasze możliwości, obecne rozwiązania na rynku oraz dostępną technologię
w naszym budżecie (0 zł), postanowiliśmy stworzyć aplikację webową. Użytkownikiem
docelowym naszej aplikacji jest *historyk amator*, wymagający dużej elastyczności
rozwiązania, lecz nie wymagający wielu funkcjonalności.

Nasze rozwiązanie będzie się skupiało głównie na zarządzaniu danymi zawartymi w 
relacjach między osobami

