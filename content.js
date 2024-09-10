let hideTooltipTimeout;
let activeLink = null;

const tooltip = document.createElement('div');
tooltip.id = 'tooltip';
tooltip.style.display = 'none';
tooltip.style.position = 'absolute';
tooltip.style.zIndex = '1000';
tooltip.style.padding = '10px';
tooltip.style.backgroundColor = '#2e2e2e';
tooltip.style.color = '#ffffff';
tooltip.style.borderRadius = '10px';
tooltip.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
tooltip.style.maxWidth = '350px';
tooltip.innerHTML = `
    <div id="tooltip-content">
        <!-- Tooltip content will be dynamically updated -->
    </div>
    <button style="
        margin-top: 10px;
        padding: 8px;
        background-color: #444444;
        color: #ffffff;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
    ">Open this link in VM</button>
`;

document.body.appendChild(tooltip);

function handleMouseOver(event) {
    if (event.target.tagName === 'A' && event.target.href) {
        const href = event.target.href;
        const riskLevel = 'safe'; // Default risk level
        const message = 'This link appears safe'; // Default message
        showTooltip(event, href, riskLevel, message);
    }
}

function handleMouseOut(event) {
    if (event.target.tagName === 'A') {
        startHideTooltip();
    }
}

document.addEventListener('mouseover', handleMouseOver);
document.addEventListener('mouseout', handleMouseOut);

tooltip.addEventListener('mouseenter', cancelHideTooltip);
tooltip.addEventListener('mouseleave', hideTooltip);

function showTooltip(event, href, riskLevel, message) {
    if (activeLink && activeLink !== event.target) {
        hideTooltip();
    }

    activeLink = event.target;

    const riskColors = {
        safe: '#2ecc71',
        malicious: '#f39c12',
        danger: '#e74c3c'
    };
    const riskIcons = {
        safe: '✔️',
        malicious: '⚠️',
        danger: '❌'
    };

    const truncatedHref = href.length > 50 ? href.slice(0, 50) + '...' : href;

    tooltip.querySelector('#tooltip-content').innerHTML = `
        <div style="
            display: flex;
            align-items: center;
            font-weight: bold;
            margin-bottom: 10px;
            background-color: ${riskColors[riskLevel]};
            padding: 8px;
            border-radius: 5px;
            color: #ffffff;
        ">
            <div style="font-size: 24px; margin-right: 10px;">${riskIcons[riskLevel]}</div>
            <div>${riskLevel.toUpperCase()}</div>
        </div>
        <div style="margin-bottom: 5px;">Risk: ${message}</div>
        <div id="actual-url" style="word-wrap: break-word; max-width: 300px; margin-top: 5px; cursor: pointer;">
            Actual URL: <span id="url-display">${truncatedHref}</span>
        </div>
    `;

    const rect = event.target.getBoundingClientRect();
    tooltip.style.left = `${rect.left + window.scrollX}px`;
    tooltip.style.top = `${rect.bottom + window.scrollY + 5}px`;

    tooltip.style.display = 'block';

    const urlDisplay = tooltip.querySelector('#url-display');
    urlDisplay.addEventListener('click', () => {
        if (urlDisplay.textContent === truncatedHref) {
            urlDisplay.textContent = href;
        } else {
            urlDisplay.textContent = truncatedHref;
        }
    });
}

function startHideTooltip() {
    hideTooltipTimeout = setTimeout(hideTooltip, 200);
}

function cancelHideTooltip() {
    clearTimeout(hideTooltipTimeout);
}

function hideTooltip() {
    tooltip.style.display = 'none';
    activeLink = null;
}

function toggleHoverDetection(isEnabled) {
    if (isEnabled) {
        document.addEventListener('mouseover', handleMouseOver);
        document.addEventListener('mouseout', handleMouseOut);
    } else {
        document.removeEventListener('mouseover', handleMouseOver);
        document.removeEventListener('mouseout', handleMouseOut);
        hideTooltip();
    }
}
