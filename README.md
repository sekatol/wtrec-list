# wtrec-list
A browser console script that lists all wtrec's stored in dwem-wtrec IndexedDB

# Usage
- Goto the webpage `crawl.nemelex.cards/#lobby`
- Press `F12`
- Click on the `Console` tab
- Paste the following command into it and press `Enter`
```javascript
fetch('https://raw.githubusercontent.com/sekatol/wtrec-list/main/wtrec_list.js').then(r => r.text()).then(code => eval(code));
```
