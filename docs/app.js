(() => {
    const { repo, navLinks, heroPoints, features, providers, jibSimhubProfiles, media, compatibility, statusFilters } = window.jibSiteData;

    const page = document.body.dataset.page || '';

    let activeMedia = 0;
    let activeStatus = 'All';

    const $ = selector => document.querySelector(selector);
    const $$ = selector => Array.from(document.querySelectorAll(selector));

    function escapeHtml(value = '') {
        return String(value)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function slug(value) {
        return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }

    /* ---------- Shared chrome: topbar + footer ---------- */

    function renderTopbar() {
        const topbar = $('#topbar');
        if (!topbar) return;

        const links = navLinks.map(item => {
            let href = item.href;
            if (!item.page && item.href === 'index.html#latest' && page === 'home') href = '#latest';
            const active = item.page === page ? ' class="active"' : '';
            const target = item.external ? ' target="_blank" rel="noopener"' : '';
            return `<a href="${escapeHtml(href)}"${active}${target}>${escapeHtml(item.label)}</a>`;
        }).join('');

        topbar.innerHTML = `
            <div class="wrap topbar-inner">
                <a class="brand" href="index.html" aria-label="JIB home">
                    <img class="brand-icon" src="icon.png" alt="" />
                    <span>
                        <strong class="brand-title">JIB</strong>
                        <span class="brand-subtitle">Jack In the Box</span>
                    </span>
                </a>
                <button class="nav-toggle" type="button" id="navToggle" aria-expanded="false" aria-label="Toggle navigation">Menu</button>
                <nav class="nav" aria-label="Primary navigation">${links}</nav>
            </div>
        `;

        const toggle = $('#navToggle');
        const nav = topbar.querySelector('.nav');
        toggle.addEventListener('click', () => {
            const open = nav.classList.toggle('open');
            toggle.setAttribute('aria-expanded', String(open));
        });
        nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
            nav.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
        }));
    }

    function renderFooter() {
        const footer = $('#footer');
        if (!footer) return;
        footer.innerHTML = 'JIB project homepage - <a href="https://github.com/androme13/JIB" target="_blank" rel="noopener">Repository</a>';
    }

    function renderBackTop() {
        if (!$('.backtop')) return;
        const btn = $('.backtop');
        window.addEventListener('scroll', () => {
            btn.classList.toggle('show', window.scrollY > 600);
        }, { passive: true });
        btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    /* ---------- Home renderers ---------- */

    function renderCards(target, items, kicker) {
        $(target).innerHTML = items.map(([title, body]) => `
            <article class="feature">
                <div class="feature-kicker">${escapeHtml(kicker)}</div>
                <h3>${escapeHtml(title)}</h3>
                <p>${escapeHtml(body)}</p>
            </article>
        `).join('');
    }

    function renderSimhubProfiles() {
        $('#simhubProfileGrid').innerHTML = jibSimhubProfiles.map(([title, body]) => `
            <article class="game-profile">
                <div class="feature-kicker">JIB profile</div>
                <h3>${escapeHtml(title)}</h3>
                <p>${escapeHtml(body)}</p>
            </article>
        `).join('');
    }

    function renderHeroPoints() {
        $('#heroPoints').innerHTML = heroPoints.map(([title, body]) => `
            <div class="hero-point">
                <strong>${escapeHtml(title)}</strong>
                <span>${escapeHtml(body)}</span>
            </div>
        `).join('');
    }

    function openLightbox(src) {
        const lightbox = $('#lightbox');
        if (!lightbox) return;
        $('#lightboxImage').src = src;
        lightbox.classList.add('open');
        document.body.classList.add('locked');
        $('#lightboxClose').focus();
    }

    function closeLightbox() {
        const lightbox = $('#lightbox');
        if (!lightbox) return;
        lightbox.classList.remove('open');
        $('#lightboxImage').src = '';
        document.body.classList.remove('locked');
    }

    function renderGallery() {
        const [src, title] = media[activeMedia];
        $('#mediaGallery').innerHTML = `
            <div class="gallery-stage">
                <img class="gallery-image" src="${escapeHtml(src)}" alt="${escapeHtml(title)}" onclick="openLightbox(this.src)" />
                <button class="gallery-arrow gallery-prev" type="button" aria-label="Previous preview" onclick="showMedia(${activeMedia - 1})">&lsaquo;</button>
                <button class="gallery-arrow gallery-next" type="button" aria-label="Next preview" onclick="showMedia(${activeMedia + 1})">&rsaquo;</button>
                <div class="gallery-caption">
                    <strong>${escapeHtml(title)}</strong>
                    <span>${activeMedia + 1} / ${media.length}</span>
                </div>
            </div>
            <div class="gallery-thumbs">
                ${media.map(([thumb, thumbTitle], index) => `
                    <button class="gallery-thumb" type="button" aria-label="Show ${escapeHtml(thumbTitle)}" aria-current="${index === activeMedia}" onclick="showMedia(${index})">
                        <img src="${escapeHtml(thumb)}" alt="${escapeHtml(thumbTitle)}" loading="lazy" />
                    </button>
                `).join('')}
            </div>
        `;
    }

    function showMedia(index) {
        activeMedia = (index + media.length) % media.length;
        renderGallery();
    }

    function statusClass(status) {
        if (status === 'Catalog matched') return 'validated';
        return 'needs';
    }

    function renderCompatibilityFilters() {
        const availableStatuses = ['All', ...statusFilters.filter(status =>
            compatibility.some(row => row[2] === status)
        )];

        $('#compatFilters').innerHTML = availableStatuses.map(status => `
            <button class="chip ${status === activeStatus ? 'active' : ''}" type="button" onclick="setStatusFilter('${escapeHtml(status)}')">${escapeHtml(status)}</button>
        `).join('');
    }

    function setStatusFilter(status) {
        activeStatus = status;
        renderCompatibility();
    }

    function renderCompatibility() {
        const compatSearch = $('#compatSearch');
        const query = compatSearch.value.trim().toLowerCase();
        const rows = compatibility.filter(row => {
            const [brand, model, status, family, notes] = row;
            const matchesStatus = activeStatus === 'All' || status === activeStatus;
            const matchesQuery = !query || [brand, model, status, family, notes].join(' ').toLowerCase().includes(query);
            return matchesStatus && matchesQuery;
        });

        const counts = compatibility.reduce((acc, row) => {
            acc[row[2]] = (acc[row[2]] || 0) + 1;
            return acc;
        }, {});

        const summaryItems = [
            ['Catalog matched', counts['Catalog matched'] || 0],
            ['Family profile', counts['Family profile'] || 0],
            ['Needs validation', counts['Needs device validation'] || 0]
        ].filter(([, value]) => value > 0);

        $('#compatSummary').innerHTML = summaryItems.map(([label, value]) => `
            <div class="summary-item">
                <strong>${value}</strong>
                <span>${escapeHtml(label)}</span>
            </div>
        `).join('');

        $('#compatBody').innerHTML = rows.length
            ? rows.map(([brand, model, status, family, notes]) => `
                <tr>
                    <td>${escapeHtml(brand)}</td>
                    <td>${escapeHtml(model)}</td>
                    <td><span class="status ${statusClass(status)}">${escapeHtml(status)}</span></td>
                    <td>${escapeHtml(family)}</td>
                    <td>${escapeHtml(notes || '-')}</td>
                </tr>
            `).join('')
            : '<tr><td colspan="5" class="muted">No compatible hardware entry matches this filter.</td></tr>';

        renderCompatibilityFilters();
    }

    /* ---------- Releases (home) ---------- */

    function formatDate(value) {
        if (!value) return 'Unknown date';
        return new Date(value).toLocaleString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function formatSize(bytes = 0) {
        if (!bytes) return 'Unknown size';
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = Number(bytes);
        let index = 0;
        while (size >= 1024 && index < units.length - 1) {
            size /= 1024;
            index += 1;
        }
        return `${size.toFixed(size >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
    }

    function releaseTitle(release) {
        return release.name?.trim() || release.tag_name || 'Untitled release';
    }

    function packageAssets(release) {
        return (release.assets || []).filter(asset => {
            const name = String(asset.name || '').toLowerCase();
            return asset.browser_download_url && ['.zip', '.7z', '.rar', '.msi', '.exe'].some(ext => name.endsWith(ext));
        });
    }

    function primaryAsset(release) {
        const assets = packageAssets(release);
        return assets.find(asset => String(asset.name || '').toLowerCase().endsWith('.zip')) || assets[0] || null;
    }

    function releaseDownloads(release) {
        return packageAssets(release).reduce((total, asset) => total + Number(asset.download_count || 0), 0);
    }

    function downloadsLabel(count) {
        const value = Number(count || 0);
        return `${value.toLocaleString()} ${value === 1 ? 'download' : 'downloads'}`;
    }

    function inlineMarkdown(value) {
        return value
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    }

    function renderMarkdown(source) {
        const raw = String(source ?? '').trim();
        if (!raw) return '<p>No release notes provided.</p>';

        const lines = escapeHtml(raw).split('\n');
        const out = [];
        let inCode = false;
        let listType = null;

        const flushList = () => {
            if (listType) { out.push(`</${listType}>`); listType = null; }
        };

        for (const line of lines) {
            if (line.trim().startsWith('```')) {
                flushList();
                if (inCode) { out.push('</code></pre>'); inCode = false; }
                else { out.push('<pre><code>'); inCode = true; }
                continue;
            }
            if (inCode) { out.push(line); continue; }

            const text = line.trim();
            if (!text) { flushList(); continue; }

            const heading = text.match(/^(#{1,4})\s+(.*)$/);
            if (heading) {
                flushList();
                const level = heading[1].length;
                out.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
                continue;
            }

            const ul = text.match(/^[-*]\s+(.*)$/);
            if (ul) {
                if (listType !== 'ul') { flushList(); out.push('<ul>'); listType = 'ul'; }
                out.push(`<li>${inlineMarkdown(ul[1])}</li>`);
                continue;
            }

            const ol = text.match(/^\d+[.)]\s+(.*)$/);
            if (ol) {
                if (listType !== 'ol') { flushList(); out.push('<ol>'); listType = 'ol'; }
                out.push(`<li>${inlineMarkdown(ol[1])}</li>`);
                continue;
            }

            flushList();
            out.push(`<p>${inlineMarkdown(text)}</p>`);
        }

        if (inCode) out.push('</code></pre>');
        flushList();
        return out.join('\n');
    }

    function renderAssets(release) {
        const assets = packageAssets(release);
        if (!assets.length) {
            return '<div class="empty">No packaged downloadable asset is attached to this release yet. Attach a zip, 7z, rar, msi, or exe asset in GitHub Releases and it will appear here automatically.</div>';
        }

        return `<div class="asset-list">${assets.map(asset => `
            <div class="asset">
                <div>
                    <strong>${escapeHtml(asset.name)}</strong>
                    <span>${formatSize(asset.size)} - ${downloadsLabel(asset.download_count)}</span>
                </div>
                <a class="btn btn-primary" href="${escapeHtml(asset.browser_download_url)}" target="_blank" rel="noopener">Download</a>
            </div>
        `).join('')}</div>`;
    }

    function renderLatest(release) {
        return `
            <div class="release-grid">
                <div class="release-box">
                    <div class="eyebrow">Latest package</div>
                    <div class="release-title">${escapeHtml(releaseTitle(release))}</div>
                    <div class="meta">
                        <span><strong>Tag:</strong> ${escapeHtml(release.tag_name || 'N/A')}</span>
                        <span><strong>Published:</strong> ${escapeHtml(formatDate(release.published_at))}</span>
                        <span><strong>Status:</strong> ${release.prerelease ? 'Pre-release' : 'Stable release'}</span>
                        <span><strong>Downloads:</strong> ${escapeHtml(downloadsLabel(releaseDownloads(release)))}</span>
                    </div>
                    <div class="release-body">${renderMarkdown(release.body)}</div>
                </div>
                <div class="release-box">
                    <h3>Package assets</h3>
                    ${renderAssets(release)}
                </div>
            </div>
        `;
    }

    function renderHistoryItem(release) {
        const assets = packageAssets(release);
        return `
            <div class="history-item">
                <div>
                    <strong>${escapeHtml(releaseTitle(release))}</strong>
                    <span>${escapeHtml(release.tag_name || 'N/A')} - ${escapeHtml(formatDate(release.published_at))} - ${escapeHtml(downloadsLabel(releaseDownloads(release)))}</span>
                </div>
                ${assets[0]
                    ? `<a class="btn" href="${escapeHtml(assets[0].browser_download_url)}" target="_blank" rel="noopener">Download</a>`
                    : '<span class="btn btn-muted">No package</span>'}
            </div>
        `;
    }

    function renderReleaseFallback(error) {
        console.error(error);
        const releaseCount = $('#releaseCount');
        const latestVersionStat = $('#latestVersionStat');
        const latestContent = $('#latestContent');
        const historyContent = $('#historyContent');
        if (releaseCount) releaseCount.textContent = '-';
        if (latestVersionStat) latestVersionStat.textContent = 'Unavailable';
        if (latestContent) latestContent.innerHTML = `
            <div class="error">
                GitHub release data is not available from this browser right now. You can still open the repository release page directly.
                <div class="hero-actions"><a class="btn btn-primary" href="${repo.releasesUrl}" target="_blank" rel="noopener">Open GitHub Releases</a></div>
            </div>
        `;
        if (historyContent) historyContent.innerHTML = '<div class="empty">Release history appears automatically when GitHub API access is available.</div>';
    }

    async function loadReleases() {
        const releaseCount = $('#releaseCount');
        const latestVersionStat = $('#latestVersionStat');
        const latestContent = $('#latestContent');
        const historyContent = $('#historyContent');
        const heroDownloadBtn = $('#heroDownloadBtn');

        try {
            const response = await fetch(repo.apiUrl, {
                headers: { Accept: 'application/vnd.github+json' }
            });

            if (!response.ok) {
                throw new Error(`GitHub API returned ${response.status}`);
            }

            const releases = (await response.json()).filter(release => !release.draft);
            if (releaseCount) releaseCount.textContent = String(releases.length);

            if (!releases.length) {
                if (latestVersionStat) latestVersionStat.textContent = 'Not published yet';
                if (latestContent) latestContent.innerHTML = `<div class="empty">No public release has been published for ${repo.owner}/${repo.name} yet.</div>`;
                if (historyContent) historyContent.innerHTML = '<div class="empty">Release history will appear here after the first public package.</div>';
                return;
            }

            const latest = releases[0];
            if (latestVersionStat) latestVersionStat.textContent = latest.tag_name || releaseTitle(latest);
            if (latestContent) latestContent.innerHTML = renderLatest(latest);

            const primary = primaryAsset(latest);
            if (primary && heroDownloadBtn) {
                heroDownloadBtn.href = primary.browser_download_url;
                heroDownloadBtn.textContent = 'Download latest package';
            }

            const older = releases.slice(1);
            if (historyContent) historyContent.innerHTML = older.length
                ? `<div class="history">${older.map(renderHistoryItem).join('')}</div>`
                : '<div class="empty">Only one public release is available at the moment.</div>';
        } catch (error) {
            renderReleaseFallback(error);
        }
    }

    /* ---------- Guide: table of contents + scroll spy ---------- */

    function initGuideToc() {
        const toc = $('#toc');
        const prose = $('#guideContent');
        if (!toc || !prose) return;

        const headings = $$('#guideContent h2, #guideContent h3');
        if (!headings.length) return;

        const items = [];
        headings.forEach(heading => {
            if (!heading.id) heading.id = slug(heading.textContent.trim());
            items.push({ id: heading.id, text: heading.textContent.trim(), level: heading.tagName.toLowerCase() });
        });

        toc.innerHTML = `
            <details class="toc-details" id="tocDetails">
                <summary>On this page</summary>
                <ul>${items.map(item => `
                    <li class="toc-${item.level}"><a href="#${item.id}">${escapeHtml(item.text)}</a></li>
                `).join('')}</ul>
            </details>
        `;

        const details = $('#tocDetails');
        const isDesktop = () => window.matchMedia('(min-width: 981px)').matches;
        const applyTocState = () => { details.open = isDesktop(); };
        applyTocState();
        window.addEventListener('resize', applyTocState);

        const links = $$('#toc a');

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    links.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
                }
            });
        }, { rootMargin: '-90px 0px -60% 0px', threshold: 0 });

        items.forEach(item => {
            const el = document.getElementById(item.id);
            if (el) observer.observe(el);
        });

        links.forEach(link => {
            link.addEventListener('click', () => {
                links.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                if (!isDesktop()) details.open = false;
            });
        });
    }

    /* ---------- Init ---------- */

    renderTopbar();
    renderFooter();
    renderBackTop();

    const lightbox = $('#lightbox');
    if (lightbox) {
        lightbox.addEventListener('click', closeLightbox);
        const lightboxImage = $('#lightboxImage');
        lightboxImage.addEventListener('click', event => event.stopPropagation());
        $('#lightboxClose').addEventListener('click', closeLightbox);
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape') closeLightbox();
            if (page === 'home' && event.key === 'ArrowLeft') showMedia(activeMedia - 1);
            if (page === 'home' && event.key === 'ArrowRight') showMedia(activeMedia + 1);
        });
    }

    if (page === 'home') {
        const compatSearch = $('#compatSearch');
        if (compatSearch) compatSearch.addEventListener('input', renderCompatibility);

        renderHeroPoints();
        renderCards('#featureGrid', features, 'Capability');
        renderCards('#providerGrid', providers, 'Provider');
        renderSimhubProfiles();
        renderGallery();
        renderCompatibility();
        loadReleases();
    }

    if ($('#toc') && $('#guideContent')) {
        initGuideToc();
    }

    window.openLightbox = openLightbox;
    window.showMedia = showMedia;
    window.setStatusFilter = setStatusFilter;
})();
