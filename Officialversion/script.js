// 全局变量 - 初始化为空数组，将从配置文件加载
let imageSources = [];


const urlSelect = document.getElementById('urlSelect');
const btnNew = document.getElementById('btnNew');
const btnClear = document.getElementById('btnClear');
const btnDownload = document.getElementById('btnDownload');
const displayImg = document.getElementById('displayImg');
const placeholder = document.getElementById('placeholder');
const imageFrame = document.getElementById('imageFrame');
const statusMessage = document.getElementById('statusMessage');
const toast = document.getElementById('toast');

let currentImageUrl = '';
let finalImageBlobUrl = ''; 


function showToast(message) {
    toast.textContent = message;
    toast.className = "toast show";
    setTimeout(function(){ toast.className = toast.className.replace("show", ""); }, 3000);
}

// 从JSON文件加载配置
async function loadConfiguration() {
    try {
        const response = await fetch('image-sources.json');
        if (!response.ok) throw new Error('配置文件请求失败');
        
        const data = await response.json();
        
        // 验证配置数据格式
        if (!Array.isArray(data)) {
            throw new Error('配置文件格式错误: 根元素不是数组');
        }
        
        imageSources = data;
        populateSelect(urlSelect, imageSources);
        updateUIState();
        console.log('配置文件加载成功，共有 ' + imageSources.length + ' 个图片源');
    } catch (error) {
        console.error('加载配置文件失败:', error);
        showToast('配置加载失败，使用内置配置');
        
        // 配置加载失败时使用内置配置作为后备
        imageSources = getDefaultImageSources();
        populateSelect(urlSelect, imageSources);
        updateUIState();
    }
}

// 内置默认配置（后备方案）
function getDefaultImageSources() {
    return [
        {
            text: "Picsum (支持CORS)",
            value: "https://picsum.photos/600/400?{{timestamp}}",
            clickAction: 'fullscreen',
            showDownload: true
        },
        {
            text: "樱花(二次元 - 支持CORS)",
            value: "https://www.dmoe.cc/random.php?{{timestamp}}",
            clickAction: 'none',
            showDownload: false
        },
        {
            text: "搏天api(真人 - 响应慢)",
            value: "https://api.btstu.cn/sjbz/api.php?{{timestamp}}",
            clickAction: 'fullscreen',
            showDownload: true
        },
        {
            text: "保罗(二次元 - 响应慢)",
            value: "https://api.paugram.com/wallpaper/?{{timestamp}}",
            clickAction: 'fullscreen',
            showDownload: true
        },
        {
            text: "墨天逸(二次元 - 响应慢)",
            value: "https://api.mtyqx.cn/tapi/random.php?{{timestamp}}",
            clickAction: 'none',
            showDownload: false
        },
        {
            text: "岁月小筑(二次元 - 支持CORS)",
            value: "https://img.xjh.me/random_img.php?return=302&{{timestamp}}",
            clickAction: 'none',
            showDownload: false
        }
    ];
}

// 自动填充下拉列表
function populateSelect(selectElement, data) {
    selectElement.innerHTML = '';
    data.forEach(item => {
        // 确保每个项目都有必需的属性
        if (!item.value) {
            console.warn('配置项缺少value属性:', item);
            return;
        }
        selectElement.add(new Option(item.text, item.value));
    });
}

// 获取当前选择的图片源配置
function getCurrentSourceConfig() {
    const currentValue = urlSelect.value;
    return imageSources.find(source => source.value === currentValue) || imageSources[0];
}

// 处理时间戳
function processUrlWithTimestamp(baseUrl) {
    if (!baseUrl) return '';
    if (baseUrl.includes('{{timestamp}}')) {
        const timestamp = new Date().getTime();
        return baseUrl.replace('{{timestamp}}', timestamp);
    }
    return baseUrl;
}

// 更新UI状态
function updateUIState() {
    const config = getCurrentSourceConfig();
    if (config.showDownload) {
        btnDownload.style.display = 'block';
    } else {
        btnDownload.style.display = 'none';
    }
}

// 获取新图片
btnNew.addEventListener('click', async () => {
    const baseUrl = urlSelect.value;
    if (!baseUrl) return;

    const finalUrl = processUrlWithTimestamp(baseUrl);
    currentImageUrl = finalUrl;

    // 修复点：开始新加载时，强制重置 blob URL，防止使用旧数据
    finalImageBlobUrl = ''; 
    
    statusMessage.textContent = '正在加载图片...';
    
    displayImg.style.display = 'none';
    placeholder.style.display = 'block';
    btnDownload.disabled = true;
    btnDownload.textContent = '下载图片';

    try {
        // 策略1: 尝试通过fetch获取图片blob
        const response = await fetch(finalUrl);
        if (!response.ok) throw new Error('网络请求失败');
        
        const blob = await response.blob();
        finalImageBlobUrl = window.URL.createObjectURL(blob);
        
        displayImg.onload = function() {
            statusMessage.textContent = '';
            displayImg.style.display = 'block';
            placeholder.style.display = 'none';
            updateUIState();
            btnDownload.disabled = false;
        };
        
        displayImg.onerror = function() {
            statusMessage.textContent = '图片加载失败，请尝试更换图片源。';
            showToast('图片加载失败');
            if (finalImageBlobUrl) {
                window.URL.revokeObjectURL(finalImageBlobUrl);
                finalImageBlobUrl = '';
            }
            btnDownload.disabled = true;
        };

        displayImg.src = finalImageBlobUrl;
        
    } catch (error) {
        console.error('加载图片出错:', error);
        statusMessage.textContent = '直接加载中...';
        
        // 策略2: 降级为直接设置src（此时finalImageBlobUrl为空）
        displayImg.onload = function() {
            statusMessage.textContent = '';
            displayImg.style.display = 'block';
            placeholder.style.display = 'none';
            updateUIState();
            btnDownload.disabled = false;
        };
        
        displayImg.onerror = function() {
            statusMessage.textContent = '图片加载失败，请尝试更换图片源。';
            showToast('图片加载失败');
            btnDownload.disabled = true;
        };

        displayImg.src = finalUrl;
    }
});

// 清空图片
btnClear.addEventListener('click', () => {
    displayImg.src = '';
    displayImg.style.display = 'none';
    placeholder.style.display = 'block';
    currentImageUrl = '';
    if (finalImageBlobUrl) {
        window.URL.revokeObjectURL(finalImageBlobUrl);
        finalImageBlobUrl = '';
    }
    statusMessage.textContent = '';
    btnDownload.disabled = true;
    btnDownload.textContent = '下载图片';
    updateUIState(); 
});

// 图片点击事件处理 
displayImg.addEventListener('click', async () => {
    if (!displayImg.src || displayImg.style.display === 'none') return;

    const config = getCurrentSourceConfig();

    if (config.clickAction === 'fullscreen') {
        // 修复点：全屏逻辑增强
        if (finalImageBlobUrl) {
            // 情况A: 已有 Blob，直接全屏
            createFullscreenImage(finalImageBlobUrl);
        } else {
            // 情况B: 没有 Blob (可能是直接加载模式)，尝试获取 Blob 以支持全屏
            try {
                showToast('正在准备全屏...');
                const response = await fetch(currentImageUrl);
                if (!response.ok) throw new Error('无法获取图片');
                const blob = await response.blob();
                const blobUrl = window.URL.createObjectURL(blob);
                createFullscreenImage(blobUrl);
                // 注意：这里创建的临时blobUrl在关闭全屏时会被销毁，不需要存在全局变量中
            } catch (e) {
                console.error(e);
                showToast('全屏准备失败，尝试在新窗口打开');
                // 最后的降级：如果连fetch都失败，才新窗口打开
                window.open(currentImageUrl, '_blank');
            }
        }
    } 
});

// 辅助函数：创建全屏图片
function createFullscreenImage(url) {
    const img = document.createElement('img');
    img.src = url;
    img.style.width = '100vw';
    img.style.height = '100vh';
    img.style.objectFit = 'contain';
    img.style.position = 'fixed';
    img.style.top = '0';
    img.style.left = '0';
    img.style.zIndex = '9999';
    img.style.backgroundColor = 'rgba(0,0,0,0.9)';
    img.style.cursor = 'zoom-out';
    
    // 点击关闭全屏
    img.onclick = () => {
        // 如果是blob:开头的临时链接，关闭时释放内存
        if (url.startsWith('blob:') && url !== finalImageBlobUrl) {
            window.URL.revokeObjectURL(url);
        }
        if (document.body.contains(img)) {
            document.body.removeChild(img);
        }
    };
    
    document.body.appendChild(img);
}

// 下载按钮点击事件处理
btnDownload.addEventListener('click', async () => {
    if (!displayImg.src || displayImg.style.display === 'none') {
        showToast('请先加载一张图片');
        return;
    }

    btnDownload.disabled = true;
    const originalText = btnDownload.textContent;
    btnDownload.textContent = '下载中...';
    statusMessage.textContent = '正在准备下载...';

    try {
        if (finalImageBlobUrl) {
            const response = await fetch(finalImageBlobUrl);
            if (!response.ok) throw new Error('Blob请求失败');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            const filename = `image_${new Date().getTime()}.${blob.type.split('/')[1] || 'png'}`;
            a.download = filename;

            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            statusMessage.textContent = '';
            showToast('下载已开始');
        } else {
            const response = await fetch(currentImageUrl);
            if (!response.ok) throw new Error('网络请求失败');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            const filename = `image_${new Date().getTime()}.${blob.type.split('/')[1] || 'png'}`;
            a.download = filename;

            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            statusMessage.textContent = '';
            showToast('下载已开始');
        }
        
    } catch (error) {
        console.error('下载失败:', error);
        let errorMessage = '下载失败。';
        
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.name === 'TypeError') {
            errorMessage += '\n原因：服务器不支持CORS或网络错误。\n建议：更换图片源或尝试新窗口打开。';
        } else {
            errorMessage += '\n原因：' + error.message;
        }
        
        statusMessage.textContent = errorMessage;
        showToast('下载失败');
        
        setTimeout(() => {
            if (confirm('下载失败')) {
                window.open(currentImageUrl, '_blank');
            }
        }, 100);
    } finally {
        btnDownload.disabled = false;
        btnDownload.textContent = originalText;
    }
});

// 页面加载完成后自动加载配置
document.addEventListener('DOMContentLoaded', loadConfiguration);
