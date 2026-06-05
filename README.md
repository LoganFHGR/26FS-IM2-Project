# Edelmetaltracker Webseite "Adler Metals" 

## Team
    -Dominik Boruta
    -Logan Stein

## Kurzbeschreibung
Die Applikation zeigt Live-Preise der vier Edelmetalle über die metals.dev API, wobei die Daten für 10 Minuten gecacht werden, um unnötige API-Anfragen zu vermeiden. Ein interaktiver Preischart ermöglicht die Darstellung in vier Zeiträumen: einer Woche, einem Monat, YTD sowie einem Gesamtverlauf seit 1978. Die Preise lassen sich dabei in vier Währungen anzeigen: CHF, USD, EUR und GBP. Ergänzt wird die App durch ein Kaufen/Verkaufen-Interface sowie einen Bestandesrechner, mit dem der aktuelle Wert eigener Edelmetallbestände berechnet werden kann. Die Benutzeroberfläche wird durch animierte Elemente mit Lottie aufgewertet.

## Learnings
Die Verwendung von Chart.js und wie man vereinfacht Daten in einem Graphen darstellen kann. Die Einbindung von Animationen durch .json-Dateien, damit man sie nicht im CSS stylen muss.

## Schierigkeiten
Das Einbinden von Daten und die Darstellung dieser in einem Chart war kompliziert, da die Daten zuerst umgewandelt werden müssen und historische Daten sowie Daten von einer API im gleichen Graphen dargestellt werden. Eine der grössten Herausforderungen war die Erstellung der Lottie-Animationen, da das Online-Programm teilweise nicht richtig funktioniert. Tablet ansicht richtig darstellen, hoch oder querformat war sehr kompliziert.

## Known Bugs
Falls jemandem bei der Benutzung etwas auffällt, kann er sich gerne bei uns melden.

## Resourcen
Externe APIs
-metals.dev API — für Live-Preise und historische Zeitreihendaten

Libraries
-Chart.js — für den interaktiven Preischart
-Lottie — für die Animationen

-Claude (https://claude.ai/)
