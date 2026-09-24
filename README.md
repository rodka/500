# Kvíz ČKAIT – technologická zařízení staveb

Statický web pro GitHub Pages. Obsahuje **500 otázek** ze stran 1–40 dodaného souboru „Otazky ke zkousce 2024-10-31.pdf“. Poslední dvě strany souboru jsou vynechány podle zadání. Původní čísla otázek mají v dokumentu mezery; nejsou doplněna chybějící čísla.

## Stav dat

- `questions.json`: 500 záznamů pro web.
- `questions.csv`: tentýž soubor ve formátu UTF-8 s BOM a oddělovačem `;`, vhodný pro Excel.
- Původní otázka, správná odpověď a citovaný zdroj pocházejí z podkladu ČKAIT, 2. vydání V4, aktualizace 30. 7. 2026. Zalomil jsem řádky a odstranil dělení slov na konci řádku; text věcně nepřeformulovávám. Jednotky `m²` a `m³` zachovávají horní index viditelný v PDF.
- U všech **500 otázek** jsou tři doplněné možnosti ve stavu `reviewed`: každou sadu jsem prošel proti znění otázky a oficiální odpovědi, 370 sad znovu napsal nebo opravil a 130 dřívějších individuálních či číselných sad ponechal po kontrole. Doplněné možnosti jsou autorský studijní materiál, nikoli další oficiální odpovědi ČKAIT. Kontrola neznamená nezávislý právní posudek nebo potvrzení aktuálního znění všech předpisů.
- **G17** má v PDF i v tištěné verzi odpověď „kde se pro jednu zakládku nepoužije více než 20 t, celkově ročně více než 150 t“. Zápor „nepoužije“ platí pro obě meze: nejvýše 20 t na zakládku a nejvýše 150 t ročně. Původní znění zůstává beze změny; po zodpovězení otázky kvíz tento výklad připomene.

Pole `source_page` je stránka v dodaném 42stránkovém souboru. `official_pdf_page` je příslušná stránka v celé [publikaci ČKAIT](https://www.ckait.cz/otazky-k-pisemne-casti-zkousky-odborne-zpusobilosti-ckait). Odkaz u otázky otevírá původní podklad pro kontrolu.

## Spuštění a zveřejnění

Všechny soubory `index.html`, `style.css`, `cards.css`, `app.js` a `questions.json` musejí být v jednom adresáři. Při dvojkliku na HTML prohlížeč obvykle zablokuje načtení JSON; spusťte stránku přes GitHub Pages nebo místní server.

Pro GitHub Pages nahrajte soubory z tohoto balíčku přímo do kořene repozitáře. Potom otevřete **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: main → /(root) → Save**. Podle [návodu GitHubu](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) stačí pro statický web publikování z větve. Veřejný web a veřejný repozitář může číst kdokoli.

Kdo má na počítači Python, může před zveřejněním web otevřít místně příkazem `python -m http.server 8000` v adresáři těchto souborů a potom navštívit `http://localhost:8000/`.

## Ovládání

Nabídka má způsoby **Kartičky** a **Výběr A–D**, oba pro všech 500 otázek; režimy všechny / chybné / dosud neviděné / označené; filtr okruhu a délku testu. Kartičky po odkrytí správné odpovědi umožní sami označit, zda jste ji věděli. Chybná otázka zůstává ve skupině k opakování, dokud po ní nepřijdou dvě správné odpovědi za sebou. Možnosti A–D a pořadí otázek se při spuštění míchají. Úspěšnost, chybné a označené otázky jsou jen v tomto prohlížeči; tlačítka **Stáhnout zálohu výsledků** a **Načíst zálohu** přenášejí jejich stav mezi zařízeními.

Databázi lze upravit v CSV, pro web je ale nutné odpovídajícím způsobem změnit také JSON. Každý záznam má zdroj, původní číslo otázky a stav kontroly možností. V CSV se chybné možnosti jmenují `wrong_1` až `wrong_3`, v JSON jde o trojici `wrong`. Původní klíč je v obou souborech uložen odděleně v poli `correct`.
