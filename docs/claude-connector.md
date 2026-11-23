# Connettore Zonzo per claude.ai

Questa guida spiega come un Owner collega Zonzo a claude.ai e come un Admin aggiunge un evento da una chat.

## Cosa serve

- Un'organizzazione su claude.ai con un piano che permette i connettori personalizzati.
- Un account Admin del backoffice di Zonzo per ogni persona che usa la chat. Un account Organizer non può collegarsi.

## Aggiungere il connettore (Owner)

1. Su claude.ai, apri le impostazioni dell'organizzazione, alla voce Connettori (Connectors).
2. Scegli Aggiungi connettore personalizzato (Add custom connector).
3. Come nome scrivi Zonzo. Come URL scrivi l'indirizzo del sito seguito da `/api/mcp`, cioè `https://<dominio del sito>/api/mcp`.
4. Nelle impostazioni avanzate, lascia vuoti l'ID client e il segreto client.
5. Salva.

Hai finito quando Zonzo compare tra i connettori dell'organizzazione.

## Collegare il proprio account (Admin)

1. Su claude.ai, apri Impostazioni > Connettori (Settings > Connectors) e scegli Connetti (Connect) accanto a Zonzo.
2. Si apre la pagina di accesso di Zonzo. Accedi con l'email e la password del backoffice.
3. Nella pagina Autorizza l'accesso, controlla che la riga Sito dell'app indichi claude.ai, poi scegli Autorizza.

Hai finito quando claude.ai mostra Zonzo come collegato.

## Aggiungere un evento

1. Apri una nuova chat e attiva Zonzo nel menu degli strumenti.
2. Incolla la locandina, una foto o il testo dell'evento e chiedi di aggiungerlo.
3. Rispondi alle domande di Claude sui dati che mancano, per esempio l'orario di fine o l'organizzatore.
4. Leggi il riepilogo. Se è corretto, rispondi sì.
5. Quando claude.ai chiede il permesso di usare lo strumento che salva l'evento, scegli Consenti (Allow).
6. Apri il link al backoffice che ti dà Claude e aggiungi le foto.

Hai finito quando l'evento si apre nel backoffice con le sue foto.

Per cambiare un evento, chiedilo a Claude in una chat con Zonzo attivo. Claude mostra cosa cambia e aspetta un sì.

## Cosa sapere

- Un evento è pubblico sulla mappa appena Claude lo salva.
- Le foto non passano dalla chat. Un'immagine incollata serve a Claude solo per leggere i dati dell'evento.
- Se nella richiesta di permesso scegli Consenti sempre (Always allow), claude.ai non chiede più il permesso per quello strumento. Claude mostra comunque il riepilogo prima di ogni scrittura.
- Claude può leggere male una locandina. Controlla date, orari e prezzi nel riepilogo prima di rispondere sì.
- Se la password di un Admin cambia, il collegamento smette di funzionare poco dopo. Per riattivarlo, l'Admin sceglie di nuovo Connetti (Connect) accanto a Zonzo.
