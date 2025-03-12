# Geodaten Update

## Linien

Das Update der Linien-Daten, incl. properties "Status", "Datum der Fertigstellung" und "Baulastträger" (für routesegments / "Abschnitte") läuft so:

1. Im Trassenscout (TS):
   - die Planungsabschnitte im Projekt anlegen
   - die Felder "Status", "Datum der Fertigstellung" und "Baulastträger" angeben
   - den Export auf Projektebene aktivieren
2. Im CMS `Abschnitte`
   - die Abschnitte anlegen
   - als `Trassenscout Slug` den Slug des Planungsabschnitts aus dem Trassenscout angeben
3. Die Daten von TS holen:
   - https://staging.trassenscout.de/api/projects/<PROJEKT_SLUG>.json aufrufen und Datei als .json speichern (Hinweis: das Suffix .json ist richtig)
4. Datei hochladen:
   - im CMS unter `Geo Upload` > `Geo Upload Abschnitte` das neue json hochladen
   - durch Speichern werden die Punktdaten ersetzt
   - **alle bisherigen Daten werden überschrieben**
   - 1 Feature entspricht 1 Abschnitt aus `content/routesegments`
   - fehlende Geometrien zu im CMS angelegten Abschnitten können hier eingesehen werden: `/route/admin`
   - **unter 'Abschnitte' sollten alle Zeilen grün sein**
5. Neu builden:
   - nach dem build werden die neuen Geometrien in der Karte angezeigt
   - die Informationen zu "Status", "Datum der Fertigstellung" und "Baulastträger" sind entsprechend des GeoJSONs aktualisiert

## Abgleich der CMS items der Abschnitte und Detailinfos mit den Featuren aus den GeoJSONs:

Auf der Adminseite /route/admin gibt es Übersicht zum Abgleich.
