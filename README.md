# Kvíz ČKAIT – technologická zařízení staveb

Statický web pro GitHub Pages. Obsahuje **500 otázek** ze stran 1–40 dodaného souboru „Otazky ke zkousce 2024-10-31.pdf“. Poslední dvě strany souboru jsou vynechány podle zadání. Původní čísla otázek mají v dokumentu mezery; nejsou doplněna chybějící čísla.

## Stav dat

- `questions.json`: 500 záznamů pro web.
- `questions.csv`: tentýž soubor ve formátu UTF-8 s BOM a oddělovačem `;`, vhodný pro Excel.
- Původní otázka, správná odpověď a citovaný zdroj pocházejí z podkladu ČKAIT, 2. vydání V4, aktualizace 30. 7. 2026. Zalomil jsem řádky a odstranil dělení slov na konci řádku; text věcně nepřeformulovávám. Jednotky `m²` a `m³` zachovávají horní index viditelný v PDF.
- U všech **500 otázek** jsou tři doplněné možnosti ve stavu `reviewed`. Po první revizi prošlo dalších **99 chybných možností u 44 otázek** změnou podle přehledu schváleného uživatelem. U otázky **I22** o výšce horní tyče zábradlí byly navíc nahrazeny všechny 3 chybné hodnoty hodnotami 0,8 m, 0,9 m a 1,0 m; správná odpověď z podkladu je 1,1 m. Celkem jde o **102 změněných možností u 45 otázek**. Doplněné možnosti jsou autorský studijní materiál, nikoli oficiální odpovědi ČKAIT. Kontrola neznamená nezávislý právní posudek nebo potvrzení aktuálního znění všech předpisů.
- **G17** má v PDF i v tištěné verzi odpověď „kde se pro jednu zakládku nepoužije více než 20 t, celkově ročně více než 150 t“. Zápor „nepoužije“ platí pro obě meze: nejvýše 20 t na zakládku a nejvýše 150 t ročně. Původní znění zůstává beze změny; po zodpovězení otázky kvíz tento výklad připomene.

Pole `source_page` je stránka v dodaném 42stránkovém souboru. `official_pdf_page` je příslušná stránka v celé [publikaci ČKAIT](https://www.ckait.cz/otazky-k-pisemne-casti-zkousky-odborne-zpusobilosti-ckait). Odkaz u otázky otevírá původní podklad pro kontrolu.

## Spuštění a zveřejnění

Pro úplný web musejí být v jednom adresáři soubory `index.html`, `style.css`, `cards.css`, `app.js`, `questions.json`, `exam-core.js`, `exam.js`, `exam.css` a `exam-map.json`. Při dvojkliku na HTML prohlížeč obvykle zablokuje načtení JSON; spusťte stránku přes GitHub Pages nebo místní server.

Pro GitHub Pages nahrajte soubory z tohoto balíčku přímo do kořene repozitáře. Potom otevřete **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: main → /(root) → Save**. Podle [návodu GitHubu](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) stačí pro statický web publikování z větve. Veřejný web a veřejný repozitář může číst kdokoli.

Kdo má na počítači Python, může před zveřejněním web otevřít místně příkazem `python -m http.server 8000` v adresáři těchto souborů a potom navštívit `http://localhost:8000/`.

## Ovládání

Nabídka má způsoby **Kartičky** a **Výběr A–C**, oba pro všech 500 otázek; režimy všechny / chybné / dosud neviděné / označené; filtr okruhu a délku testu. Kartičky po odkrytí správné odpovědi umožní sami označit, zda jste ji věděli. Chybná otázka zůstává ve skupině k opakování, dokud po ní nepřijdou dvě správné odpovědi za sebou. Z trojice uložených chybných možností se při zobrazení náhodně vybírají dvě, takže se nabízí jedna správná a dvě chybné odpovědi A–C. Možnosti i pořadí otázek se míchají. Úspěšnost, chybné a označené otázky jsou jen v tomto prohlížeči; tlačítka **Stáhnout zálohu výsledků** a **Načíst zálohu** přenášejí jejich stav mezi zařízeními.

Databázi lze upravit v CSV, pro web je ale nutné odpovídajícím způsobem změnit také JSON. Každý záznam má zdroj, původní číslo otázky a stav kontroly možností. V CSV se chybné možnosti jmenují `wrong_1` až `wrong_3`, v JSON jde o trojici `wrong`. Původní klíč je v obou souborech uložen odděleně v poli `correct`.


## Aktualizace 6. 10. 2026 — zkouška nanečisto

Balíček obsahuje dříve schválených 102 oprav chybných možností. Otázky, správné odpovědi, vysvětlení G17 a původní číslování zůstaly beze změny.

### Dva časované režimy

1. **20 obecných + 10 oborových — pracovní členění**: 30 minut, tři odpovědi A–C, jedna správná, hodnocení obou částí zvlášť. Výběr z 329 obecných a 26 oborových otázek podle historického členění (viz omezení níže).
2. **30 otázek ze všech 500 — časovaný trénink**: stejné ovládání a čas, celá banka včetně přepracované energetiky. Zobrazuje jen bodový výsledek, protože nemá ověřené rozdělení do obou částí.

V obou režimech lze otázky přeskočit, vracet se k nim, změnit nebo zrušit odpověď. Pořadí možností se během jednoho testu nemění. Správné odpovědi a odkazy do podkladu se zobrazí až po odevzdání. Po uplynutí času se test odevzdá automaticky. Čas běží i při přepnutí do jiné karty nebo během potvrzování odevzdání. Po obnovení stránky ve stejné kartě se obnoví sestava i původní časový limit (je-li dostupné sessionStorage). Zavření karty nezaručuje obnovu.

Výsledky se do dosavadního přehledu zapisují až po odevzdání. Chybné a nezodpovězené otázky přejdou do opakování; v tréninku počítáme nezodpovězenou otázku za 0 bodů. Ukončení bez hodnocení výsledky nezapisuje. Původní klíč localStorage `ckait-tzs-quiz-v1` i formát zálohy zůstaly zachovány.

### Hodnocení sestavy 20 + 10

| Výsledek části | Obecná / 20 | Oborová / 10 |
|---|---:|---:|
| Vyhověl | 16–20 | 8–10 |
| Doplňující ústní otázky | 11–15 | 6–7 |
| Nevyhověl | 0–10 | 0–5 |

Výsledek „vyhověl“ vyžaduje splnění obou částí. Nevyhovění v kterékoli části má přednost; jinak při středním výsledku alespoň jedné části následují doplňující ústní otázky. Aplikace ústní zkoušení ani rozhodování komise nesimuluje.

### Podklady a omezení členění

- [Pokyny AR k používání testů, revize 6/2025](https://www.ckait.cz/sites/default/files/2025-07/Pokyny%20AR%20k%20pou%C5%BE%C3%ADv%C3%A1n%C3%AD%20test%C5%AF%20revize%206-25.pdf): 30 otázek, 20 + 10, nejvýše 30 minut, jedna správná a dvě logicky možné nesprávné varianty, široké zastoupení právních oblastí; u TZS se přihlíží ke specializaci uchazeče.
- [Závazné pokyny ke zkoušce, 12/2024](https://www.ckait.cz/sites/default/files/2025-01/Z%C3%A1vazn%C3%A9%20pokyny%20ke%20zkou%C5%A1ce%2012-24.pdf), část D: bodové hranice a postup při doplňujících otázkách.
- [Publikace V1.2, oprava 1. 1. 2025](https://www.ckait.cz/sites/default/files/2025-01/OTAZKY-ke-zkouskam_CKAIT_v-1.2_2025-9.1.pdf), strana 4: hvězdička u celého okruhu nebo jednotlivé otázky označuje všeobecné znalosti. A–K a R mají označení celého okruhu; v dalších okruzích se vyskytují jednotlivě označené otázky.
- [Aktuální publikace V4, 30. 7. 2026](https://www.ckait.cz/sites/default/files/2026-07/OTAZKY-ke-zkouskam-vyd%C3%A1n%C3%AD_2-2026.pdf) je zdrojem aktuálního znění našich 500 otázek a správných odpovědí.

**Mapování ve zkoušce nanečisto je pracovní rekonstrukce, nikoli potvrzené členění pro rok 2026.** Do mapy se převzaly pouze otázky se shodným zněním zadání v obou vydáních (po sjednocení zalomení, dělení slov, velikosti písmen a interpunkce). Čísla otázek se mezi vydáními liší, a proto se nepárovalo jen podle čísla. Shoda znění sama nezaručuje zachování zařazení v současné zkoušce.

`exam-map.json` obsahuje pro každou použitou otázku její současné ID, pracovní část a starší ID i stránku zdroje. `exam-membership.csv` je kontrolní přehled všech 500 otázek pro Excel. **145 nezařazených otázek včetně všech 31 otázek nynějšího okruhu O** není ve variantě 20 + 10; v běžném procvičování a časovaném tréninku je všech 500. Proto není vhodné připravovat se výhradně režimem 20 + 10.

Obecný výběr pokrývá 14 dostupných okruhů; oborový výběr jen M, N, P, pro které zůstaly doložitelné shody. Režim není přizpůsoben užší specializaci uchazeče. Pro skutečně věrnou simulaci je potřeba současné zařazení potvrzené ČKAIT; až bude k dispozici, nahradí se mapa bez změny otázek.

Ve veřejných pokynech nebyly nalezeny pevné počty pro jednotlivé okruhy A–R. Algoritmus nejprve vybere jednu otázku z každého dostupného okruhu dané části a zbytek náhodně doplní bez opakování otázky. To je tréninková volba aplikace, ne oficiální kvóta ČKAIT.

### Nahrání aktualizace přes web GitHubu

1. Před aktualizací můžete na webu kvízu použít **Stáhnout zálohu výsledků**.
2. Rozbalte celý ZIP.
3. Otevřete repozitář `rodka/500`, záložku **Code**, větev **main**.
4. Zvolte **Add file → Upload files**.
5. Nahrajte všechny soubory z rozbaleného balíčku přímo do kořene repozitáře, nikoli ZIP nebo nadřazenou složku. Stávající soubory se nahradí, soubory `exam-*` se přidají.
6. Vyplňte popis změny, například „Zkouška nanečisto a opravy odpovědí“, a stiskněte **Commit changes**.
7. Po dokončení publikování GitHub Pages otevřete svůj web a případně obnovte přes **Ctrl + F5**. Nastavení Pages nemusíte znovu měnit.

Tento balíček nebyl automaticky nahrán do repozitáře.
