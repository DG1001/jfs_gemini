
## Überarbeiteter Prompt:

# SnapPic - Live-Coding Prompt

## Basis-Prompt für alle Tools

### Rolle
Du bist ein erfahrener Python-Entwickler mit Expertise in Flask, JavaScript und Progressive Web Apps.

### Aufgabe
Erstelle eine Flask-Web-App namens "SnapPic" mit folgender Funktionalität:

#### Frontend (PWA)
- **Upload-Interface:** Benutzer können Bilder mit der Kamera des Smartphones aufnehmen oder aus der Galerie wählen und hochladen
- **Kommentar-Feld:** Kurzer Text zum Bild (max. 100 Zeichen)
- **Responsive Design:** Mobile-first, funktioniert optimal auf Smartphones
- **PWA-Features:** Manifest, Service Worker für Offline-Funktionalität, App-Icon
- **Design:** Modernes, professionelles Design mit Material Design Prinzipien

#### Backend (Flask)
- **Upload-Endpoint:** `/upload` (POST) für Bild + Kommentar
- **Gallery-Endpoint:** `/gallery` (GET) für Gallery-Ansicht
- **API-Endpoint:** `/api/images` (GET) für JSON-Daten der aktuellen Bilder
- **Static-Serving:** Bilder unter `/uploads/` verfügbar
- **Home-Route:** `/` für Upload-Interface

#### Kern-Logik
- **Timing:** Jedes Bild ist 5 Sekunden sichtbar, dann 10 Sekunden Fade-out-Animation, dann automatische Löschung
- **Kapazität:** Maximal 10 Bilder gleichzeitig in der Gallery
- **FIFO-Prinzip:** Neue Bilder verdrängen die ältesten Bilder
- **Auto-Refresh:** Gallery aktualisiert sich alle 2 Sekunden automatisch
- **Datei-Cleanup:** Automatische Löschung der Bilddateien nach Ablauf

#### Technische Anforderungen
- **Dependencies:** Nur Flask (keine zusätzlichen Python-Pakete)
- **Datenspeicherung:** Lokale JSON-Datei für Metadaten, Bilder im Dateisystem
- **Deployment:** Kann direkt mit `python app.py` gestartet werden
- **Port:** Flask-App läuft auf Port 5000
- **Dateiformate:** Unterstützt JPG, PNG, WEBP
- **Dateigröße:** Maximal 5MB pro Bild

### Constraints
- Verwende nur Standard-Python-Bibliotheken + Flask
- Keine externen CDNs, APIs oder Frameworks
- Vanilla HTML/CSS/JavaScript (kein Frontend-Framework)
- Kompatibel mit Python 3.8+
- Bilder werden im `uploads/` Ordner gespeichert
- Metadaten in `data.json` im Hauptverzeichnis

### Erwartete Dateistruktur
```
snappic/
├── app.py                 # Flask-App mit allen Routen
├── data.json             # Metadaten der Bilder
├── templates/
│   ├── index.html        # Upload-Interface
│   └── gallery.html      # Gallery-Ansicht
├── static/
│   ├── style.css         # Styling für alle Seiten
│   ├── script.js         # JavaScript-Funktionalität
│   ├── manifest.json     # PWA-Manifest
│   └── icon-192.png      # PWA-Icon
├── uploads/              # Bild-Uploads (wird automatisch erstellt)
└── requirements.txt      # Dependencies (nur Flask)
```

### Implementierungsdetails
- **Timestamps:** Verwende `datetime.now().isoformat()` für eindeutige Dateinamen
- **Validierung:** Dateityp, Dateigröße und Kommentarlänge prüfen
- **Responsive CSS:** CSS Grid/Flexbox für alle Bildschirmgrößen
- **JavaScript:** Timer-Management und Auto-Refresh-Logik
- **Fehlerbehandlung:** Aussagekräftige Fehlermeldungen für Upload-Probleme
- **Threading:** Background-Timer für automatische Bild-Löschung

### Zusätzliche Anforderungen
- Implementiere grundlegende Sicherheitsmaßnahmen gegen schädliche Uploads
- Erstelle einen funktionsfähigen Service Worker für PWA-Features
- Stelle sicher, dass die App auch bei langsameren Verbindungen funktioniert
- Füge Loading-Indikatoren für Upload-Vorgänge hinzu

## Wichtige Änderungen:

1. **Klarere Spezifikationen:** Dateiformate, Dateigröße und technische Details präzisiert
2. **Konsistenz:** "Apple Material Design" → "Material Design Prinzipien" 
3. **Datenspeicherung:** Explizite Erwähnung der JSON-Datei für Metadaten
4. **Sicherheit:** Validierung und Sicherheitsmaßnahmen ergänzt
5. **Threading:** Explizite Erwähnung für Background-Timer
6. **PWA-Details:** Service Worker und Icon-Anforderungen konkretisiert
7. **Struktur:** Klarere Trennung zwischen Frontend und Backend-Anforderungen

