function waitForModule(timeout = 10000) {
    return new Promise((resolve) => {
        const startTime = Date.now();
        const check = () => {
            const mod = window.DWEM?.Modules?.WTRec;
            if (mod) {
                resolve(mod);
                return;
            }
            if (Date.now() - startTime > timeout) {
                resolve(null);
                return;
            }
            setTimeout(check, 200);
        };
        check();
    });
}

(async function() {
    // Wait for WTRec module
    const mod = await waitForModule();
    if (!mod) {
        alert('WTRec module is not loaded.');
        return;
    }

    // Get all sessions
    const sessions = await mod.listSessions();
    if (!sessions.length) {
        alert('No saved sessions.');
        return;
    }

    // Create list panel
    const panel = document.createElement('div');
    panel.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 550px;
        max-height: 70vh;
        overflow-y: auto;
        z-index: 99999;

        box-sizing: border-box;
        margin: 0 0 12px 0;
        padding: 8px;
        border: 1px solid rgba(117, 183, 106, 0.55);
            border-left-width: 1px;
            border-left-style: solid;
            border-left-color: rgba(117, 183, 106, 0.55);
        border-left: 3px solid #75b76a;
        border-radius: 6px;

        background: rgba(9, 16, 12, 0.81);

        color: #dcebd7;
        font-size: 13px;
        line-height: 1.45;

        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
    `;

    // Title
    const title = document.createElement('div');
    title.style.cssText = 'display: flex; justify-content: space-between; margin-bottom: 12px;';
    title.innerHTML = `<b>WTRec List (total ${sessions.length})</b>`;

    const closeButton = document.createElement('button');
    closeButton.textContent = '✕';
    closeButton.style.cssText = `
        background: #c33;
        border: none;
        color: white;
        padding: 2px 6px;
        border-radius: 4px;
        cursor: pointer;`;
    closeButton.onclick = () => panel.remove();

    title.appendChild(closeButton);
    panel.appendChild(title);

    // List
    const list = document.createElement('div');
    list.style.cssText = 'display: flex; flex-direction: column; gap: 6px;';

    // Play record function
    async function playSession(session) {
        try {
            const blob = await mod.buildZipFromSession(session);
            await mod.playWTRec(blob, { autoplay: true, speed: 2 });
        } catch (err) {
            alert(`Play record failed: ${err.message}`);
        }
    }

    // Download function
    async function downloadSession(session) {
        try {
            const blob = await mod.buildZipFromSession(session);
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `${session.name || 'session'}.wtrec`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(a.href), 5000);
        } catch (err) {
            alert(`Download failed: ${err.message}`);
        }
    }

    // Add each session
    for (const session of sessions) {
        const item = document.createElement('div');
        item.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(255, 255, 255, 0.10);
            padding: 6px;
            border-radius: 4px;`;

        // Basic information
        const info = document.createElement('span');
        const messageCount = session.data?.length || 0;
        info.textContent = `${session.name || 'Untitled'} - ${messageCount} messages`;
        info.style.cssText = 'white-space: normal; word-wrap: break-word;';

        // Play button
        const playButton = document.createElement('button');
        playButton.textContent = '▶';
        playButton.style.cssText = `
            background: #28a;
            border: none;
            color: white;
            padding: 2px 6px;
            border-radius: 4px;
            cursor: pointer;`;
        playButton.onclick = (function(s) { return () => playSession(s); })(session);

        // Download button
        const downloadButton = document.createElement('button');
        downloadButton.textContent = '⬇';
        downloadButton.style.cssText = `
            background: #2a6;
            border: none;
            color: white;
            padding: 2px 6px;
            border-radius: 4px;
            cursor: pointer;`;
        downloadButton.onclick = (function(s) { return () => downloadSession(s); })(session);

        // Buttons
        const buttonGroup = document.createElement('span');
        buttonGroup.style.cssText = 'display: flex; gap: 4px;';
        buttonGroup.appendChild(playButton);
        buttonGroup.appendChild(downloadButton);

        item.appendChild(info);
        item.appendChild(buttonGroup);
        list.appendChild(item);
    }

    panel.appendChild(list);

    document.body.appendChild(panel);

    console.log('WTRec List loaded');
})();
