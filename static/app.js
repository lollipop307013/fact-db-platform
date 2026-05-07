console.log('app.js loaded v20260311-22');

const qs = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const mockEntities = [
    { id: 1001, parentId: null, name: '事件类型', tags: ['分类'], aliases: ['主分类'], reviewStatus: 'approved', description: '事件类型总分类', timeDescription: '长期有效', startTime: '2026/01/01 00:00:00', endTime: '', lang: 'zh' },
    { id: 1002, parentId: 1001, name: '版本', tags: ['分类'], aliases: ['版本线'], reviewStatus: 'approved', description: '版本相关分类', timeDescription: '按版本周期生效', startTime: '2026/01/01 00:00:00', endTime: '', lang: 'zh' },
    { id: 1003, parentId: 1002, name: '更新', tags: ['更新'], aliases: ['补丁更新'], reviewStatus: 'pending', description: '版本更新目录', timeDescription: '每月一次', startTime: '2026/03/01 00:00:00', endTime: '2026/03/31 23:59:59', lang: 'zh' },
    { id: 1004, parentId: 1002, name: '迭代', tags: ['更新'], aliases: ['阶段迭代'], reviewStatus: 'approved', description: '功能迭代目录', timeDescription: '双周迭代', startTime: '2026/03/01 00:00:00', endTime: '', lang: 'zh' },
    { id: 1010, parentId: 1001, name: '比赛', tags: ['赛事'], aliases: ['对抗赛'], reviewStatus: 'approved', description: '赛事相关分类', timeDescription: '赛季内有效', startTime: '2026/02/01 00:00:00', endTime: '2026/12/31 23:59:59', lang: 'zh' },
    { id: 1011, parentId: 1010, name: '全国大赛', tags: ['赛事'], aliases: ['国赛'], reviewStatus: 'approved', description: '全国范围赛事', timeDescription: '每季度举办', startTime: '2026/03/10 10:00:00', endTime: '2026/03/20 23:59:59', lang: 'zh' },
    { id: 1012, parentId: 1011, name: '预赛', tags: ['赛事'], aliases: ['资格赛'], reviewStatus: 'approved', description: '全国大赛预赛', timeDescription: '赛前一周', startTime: '2026/03/10 10:00:00', endTime: '2026/03/15 23:59:59', lang: 'zh' },
    { id: 1013, parentId: 1011, name: '复活赛', tags: ['赛事'], aliases: ['败者组'], reviewStatus: 'pending', description: '复活机会赛程', timeDescription: '预赛后次日', startTime: '2026/03/16 10:00:00', endTime: '2026/03/16 23:59:59', lang: 'zh' },
    { id: 1014, parentId: 1010, name: '挑战赛', tags: ['赛事'], aliases: ['挑战杯'], reviewStatus: 'approved', description: '挑战类赛事', timeDescription: '每周末', startTime: '2026/03/01 00:00:00', endTime: '', lang: 'zh' },
    { id: 1015, parentId: 1010, name: '邀请赛', tags: ['赛事'], aliases: ['邀请赛'], reviewStatus: 'pending', description: '定向邀请赛事', timeDescription: '不定期', startTime: '', endTime: '', lang: 'zh' },
    { id: 1020, parentId: null, name: '机制', tags: ['分类'], aliases: ['规则机制'], reviewStatus: 'approved', description: '玩法机制分类', timeDescription: '', startTime: '', endTime: '', lang: 'zh' },
    { id: 1021, parentId: 1020, name: '经济', tags: ['系统'], aliases: ['资源系统'], reviewStatus: 'approved', description: '经济系统与资源循环', timeDescription: '版本内保持一致', startTime: '', endTime: '', lang: 'zh' },
    { id: 1022, parentId: 1020, name: '移速', tags: ['数值'], aliases: ['移动速度'], reviewStatus: 'pending', description: '角色移动速度规则', timeDescription: '受地图模式影响', startTime: '', endTime: '', lang: 'zh' },
    { id: 1030, parentId: null, name: '术语', tags: ['分类'], aliases: ['词条'], reviewStatus: 'approved', description: '术语解释分类', timeDescription: '', startTime: '', endTime: '', lang: 'zh' },
    { id: 1031, parentId: 1030, name: '装备术语', tags: ['术语'], aliases: ['装备词条'], reviewStatus: 'approved', description: '装备相关术语', timeDescription: '', startTime: '', endTime: '', lang: 'zh' }
];

const mockEvents = [
    { id: 10599, name: '马力全开', aliases: ['马力赛'], eventTags: ['比赛'], reviewStatus: 'approved', startTime: '2026/03/10 10:00:00', endTime: '2026/03/10 23:59:59', timeDescription: '全天活动', source: '赛程公告', lang: 'zh' },
    { id: 10127, name: '海底总动员', aliases: ['海底赛季'], eventTags: ['活动'], reviewStatus: 'pending', startTime: '2026/03/11 00:00:00', endTime: '2026/03/20 23:59:59', timeDescription: '活动期间限时开启', source: '运营配置', lang: 'zh' },
    { id: 10150, name: '第三季', aliases: ['S3'], eventTags: ['版本'], reviewStatus: 'approved', startTime: '2026/03/01 00:00:00', endTime: '2026/06/30 23:59:59', timeDescription: '季度版本', source: '版本公告', lang: 'zh' },
    { id: 10149, name: '冬季赛事', aliases: ['冬冠'], eventTags: ['赛事'], reviewStatus: 'approved', startTime: '2026/12/01 00:00:00', endTime: '2026/12/31 23:59:59', timeDescription: '冬季月赛', source: '赛事中心', lang: 'zh' },
    { id: 10006, name: '无畏考场', aliases: ['考场'], eventTags: ['比赛'], reviewStatus: 'pending', startTime: '2026/02/10 00:00:00', endTime: '2026/02/15 23:59:59', timeDescription: '周内赛程', source: '测试配置', lang: 'zh' }
];

const mockFactCategories = [
    { id: 1, parentId: null, name: '赛事事实', description: '赛事相关事实' },
    { id: 2, parentId: 1, name: '赛程安排', description: '赛程时间、阶段信息' },
    { id: 3, parentId: 1, name: '赛事规则', description: '赛事规则与机制' },
    { id: 4, parentId: null, name: '版本事实', description: '版本更新与活动' },
    { id: 5, parentId: 4, name: '活动周期', description: '活动启停时间' }
];

const mockFacts = [
    { id: 50001, title: '全国大赛预赛时间', factText: '全国大赛预赛于3月10日10点开始。', reviewStatus: 'approved', uploadStatus: 'done', entityIds: [1011, 1012], eventIds: [10599], sourceType: '赛事-赛程公告', source: '赛事中心 / 官方公告（211166027680000）', sourceUrl: 'https://example.com/a', sourceContent: '问题：全国大赛预赛首轮时间？【预赛赛程表】答案：3月10日10:00开赛，3月15日23:59结束。', startTime: '2026/03/10 10:00:00', endTime: '2026/03/15 23:59:59', timeDescription: '预赛周期（工作日+周末）', lang: 'zh', contradictionReason: '', contradictingFactIds: [], duplicateFactIds: [], categoryId: 2 },
    { id: 50002, title: '复活赛时间', factText: '复活赛在预赛次日进行。', reviewStatus: 'pending', uploadStatus: 'pending', entityIds: [1013], eventIds: [10599], sourceType: 'AI抽取-运营周报', source: '内部提取 / 周报（211166052600000）', sourceUrl: '', sourceContent: '问题：复活赛安排在何时？答案：预赛结束后次日10:00-23:59。证据：运营周报第12期。', startTime: '2026/03/16 10:00:00', endTime: '2026/03/16 23:59:59', timeDescription: '预赛后次日（单日）', lang: 'zh', contradictionReason: '', contradictingFactIds: [], duplicateFactIds: [], categoryId: 2 },
    { id: 50003, title: '挑战赛开放时间', factText: '挑战赛每周末开放。', reviewStatus: 'approved', uploadStatus: 'need_update', entityIds: [1014], eventIds: [10149], sourceType: '商业化-赛事皮肤', source: '活动中心 / 玩法入口（211166086040000）', sourceUrl: '', sourceContent: '问题：挑战赛开放规则？答案：每周六00:00至周日23:59开放。备注：节假日可能延长。', startTime: '2026/03/01 00:00:00', endTime: '2026/12/31 23:59:59', timeDescription: '每周末循环开放', lang: 'zh', contradictionReason: '', contradictingFactIds: [], duplicateFactIds: [], categoryId: 5 },
    { id: 50004, title: '邀请赛状态', factText: '邀请赛为不定期赛事。', reviewStatus: 'pending', uploadStatus: 'done', entityIds: [1015], eventIds: [10149], sourceType: '赛事-运营通知', source: '运营通知 / 群公告（211166106820000）', sourceUrl: '', sourceContent: '问题：邀请赛是否固定日期？答案：非固定，按运营计划临时发布。', startTime: '2026/01/01 00:00:00', endTime: '2026/12/31 23:59:59', timeDescription: '不定期（按公告）', lang: 'zh', contradictionReason: '与旧运营文档“每月20日固定举行”冲突', contradictingFactIds: [50006], duplicateFactIds: [], categoryId: 3 },
    { id: 50005, title: '第三季版本周期', factText: '第三季版本从3月持续到6月。', reviewStatus: 'approved', uploadStatus: 'done', entityIds: [1002, 1003], eventIds: [10150], sourceType: '版本-官方公告', source: '版本公告（211166120700000）', sourceUrl: 'https://example.com/season3', sourceContent: '问题：S3版本周期？答案：2026/03/01 00:00:00 - 2026/06/30 23:59:59。', startTime: '2026/03/01 00:00:00', endTime: '2026/06/30 23:59:59', timeDescription: '季度版本', lang: 'zh', contradictionReason: '', contradictingFactIds: [], duplicateFactIds: [50007], categoryId: 4 },
    { id: 50006, title: '邀请赛固定时间', factText: '邀请赛固定在每月20日举行。', reviewStatus: 'pending', uploadStatus: 'pending', entityIds: [1015], eventIds: [10149], sourceType: '历史资料-文档抽取', source: '历史文档 / 存档页（211166132440000）', sourceUrl: '', sourceContent: '问题：邀请赛固定日期？答案：每月20日。可信度：中。', startTime: '2026/01/20 00:00:00', endTime: '2026/12/20 23:59:59', timeDescription: '每月20日（待核验）', lang: 'zh', contradictionReason: '与不定期说法冲突', contradictingFactIds: [50004], duplicateFactIds: [], categoryId: 3 },
    { id: 50007, title: '第三季英文描述', factText: 'Season 3 runs from March to June.', reviewStatus: 'approved', uploadStatus: 'done', entityIds: [1002], eventIds: [10150], sourceType: 'Human_Verified', source: 'English Notes', sourceUrl: '', sourceContent: 'translated memo', startTime: '2026/03/01 00:00:00', endTime: '2026/06/30 23:59:59', timeDescription: 'Season cycle', lang: 'en', contradictionReason: '', contradictingFactIds: [], duplicateFactIds: [50005], categoryId: 4 }
];

const entityState = {

    data: mockEntities,
    filtered: mockEntities,
    page: 1,
    pageSize: 12,
    selected: new Set(),
    selectedFormTags: new Set(),
    search: '',
    review: '',
    tag: '',
    lang: 'zh',
    treeExpanded: new Set(),
    networkExpanded: new Set(),
    networkSelectedId: null,
    network: null,
    networkNodes: null,
    networkEdges: null
};

const eventState = {
    data: mockEvents,
    filtered: mockEvents,
    page: 1,
    pageSize: 10,
    search: '',
    review: '',
    tag: '',
    lang: 'zh'
};

const factState = {
    data: mockFacts,
    filtered: mockFacts,
    categories: mockFactCategories,
    selected: new Set(),
    selectedEntityIds: new Set(),
    selectedEventIds: new Set(),
    batchSelectedEntityIds: new Set(),
    batchSelectedEventIds: new Set(),
    expandedCategories: new Set([1, 4]),
    currentCategoryId: null,
    page: 1,
    pageSize: 10
};

const CURRENT_USER = '运营同学';
const operationLogState = {
    entities: [],
    events: [],
    facts: [],
    activeModule: 'entities'
};

eventState.selectedFormTags = new Set();

function nowDateTime() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function formatDateTime(date) {
    const p = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}/${p(date.getMonth() + 1)}/${p(date.getDate())} ${p(date.getHours())}:${p(date.getMinutes())}:${p(date.getSeconds())}`;
}

function ensureAuditFieldsForRecord(record, index) {
    if (!record.updatedAt) record.updatedAt = `2026/03/${String((index % 27) + 1).padStart(2, '0')} 10:00:00`;
    if (!record.updatedBy) record.updatedBy = CURRENT_USER;
    return record;
}

function initializeAuditFields() {
    entityState.data.forEach((e, i) => ensureAuditFieldsForRecord(e, i));
    eventState.data.forEach((e, i) => ensureAuditFieldsForRecord(e, i));
    factState.data.forEach((f, i) => ensureAuditFieldsForRecord(f, i));
}

function appendOperationLog(module, action, targetId, targetName, detail = '') {
    const list = operationLogState[module];
    if (!Array.isArray(list)) return;
    list.unshift({
        time: nowDateTime(),
        operator: CURRENT_USER,
        action,
        targetId,
        targetName,
        detail
    });
    if (list.length > 200) list.length = 200;
}

function viewEntityHistory(entityId) {
    const entity = entityState.data.find(e => e.id === entityId);
    if (!entity) return;

    const title = qs('#item-history-title');
    const tbody = qs('#item-history-tbody');
    if (title) title.textContent = `实体操作记录 - ${entity.name}`;
    if (!tbody) return;

    // Generate mock operation history for this entity
    const history = generateMockHistory('entity', entityId, entity.name);

    if (!history.length) {
        tbody.innerHTML = '<tr><td colspan="3" class="loading">暂无操作记录</td></tr>';
    } else {
        tbody.innerHTML = history.map((item) => `
            <tr>
                <td>${item.time}</td>
                <td>${item.operator}</td>
                <td>${item.action}</td>
            </tr>
        `).join('');
    }

    openModal('item-history-modal');
}

function viewEventHistory(eventId) {
    const event = eventState.data.find(e => e.id === eventId);
    if (!event) return;

    const title = qs('#item-history-title');
    const tbody = qs('#item-history-tbody');
    if (title) title.textContent = `事件操作记录 - ${event.name}`;
    if (!tbody) return;

    const history = generateMockHistory('event', eventId, event.name);

    if (!history.length) {
        tbody.innerHTML = '<tr><td colspan="3" class="loading">暂无操作记录</td></tr>';
    } else {
        tbody.innerHTML = history.map((item) => `
            <tr>
                <td>${item.time}</td>
                <td>${item.operator}</td>
                <td>${item.action}</td>
            </tr>
        `).join('');
    }

    openModal('item-history-modal');
}

function viewFactHistory(factId) {
    const fact = factState.data.find(f => f.id === factId);
    if (!fact) return;

    const title = qs('#item-history-title');
    const tbody = qs('#item-history-tbody');
    if (title) title.textContent = `事实操作记录 - ${fact.title}`;
    if (!tbody) return;

    const history = generateMockHistory('fact', factId, fact.title);

    if (!history.length) {
        tbody.innerHTML = '<tr><td colspan="3" class="loading">暂无操作记录</td></tr>';
    } else {
        tbody.innerHTML = history.map((item) => `
            <tr>
                <td>${item.time}</td>
                <td>${item.operator}</td>
                <td>${item.action}</td>
            </tr>
        `).join('');
    }

    openModal('item-history-modal');
}

function generateMockHistory(type, id, name) {
    const operators = ['张三', '李四', '王五', '赵六'];
    const actions = ['创建', '审核通过', '编辑保存', '修改状态'];

    // Generate some mock history records
    const history = [];
    const now = new Date();

    // Create record
    history.push({
        time: formatDateTime(new Date(now.getTime() - Math.random() * 1000000000)),
        operator: operators[Math.floor(Math.random() * operators.length)],
        action: '创建'
    });

    // Add some random operations
    const numOps = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numOps; i++) {
        history.push({
            time: formatDateTime(new Date(now.getTime() - Math.random() * 500000000)),
            operator: operators[Math.floor(Math.random() * operators.length)],
            action: actions[Math.floor(Math.random() * actions.length)]
        });
    }

    // Sort by time descending
    history.sort((a, b) => new Date(b.time) - new Date(a.time));

    return history;
}

function closeItemHistoryModal() {
    closeModal('item-history-modal');
}

function getChildren(parentId) {



    return entityState.data.filter((e) => e.parentId === parentId);
}

function getAllTags() {
    const tags = new Set();
    entityState.data.forEach((e) => (e.tags || []).forEach((t) => tags.add(t)));
    return Array.from(tags);
}

function getEntityLevel(entity) {
    let level = 0;
    let p = entity.parentId;
    while (p !== null) {
        const parent = entityState.data.find((e) => e.id === p);
        if (!parent) break;
        level += 1;
        p = parent.parentId;
    }
    return level;
}

function switchTab(tabName) {
    const targetId = `tab-${tabName}`;
    qsa('.tabs .tab').forEach((tab) => {
        const isActive = tab.getAttribute('onclick')?.includes(`'${tabName}'`);
        tab.classList.toggle('active', !!isActive);
    });
    qsa('.tab-content').forEach((panel) => {
        const isTarget = panel.id === targetId;
        panel.classList.toggle('active', isTarget);
        panel.style.display = isTarget ? 'block' : 'none';
    });
}

function switchEntityView(view) {
    qsa('#tab-entities .entity-view').forEach((v) => {
        v.style.display = v.id === `entity-${view}-view` ? 'block' : 'none';
    });
    ['list', 'tree', 'network'].forEach((name) => {
        const btn = qs(`#entity-view-${name}-btn`);
        if (btn) btn.classList.toggle('active', name === view);
    });

    if (view === 'tree') renderEntityTree();
    if (view === 'network') renderEntityNetwork();
    else destroyEntityNetwork();
}

function switchEventView(view) {
    qsa('#tab-events .entity-view').forEach((v) => {
        v.style.display = v.id === `event-${view}-view` ? 'block' : 'none';
    });
    ['list', 'tree'].forEach((name) => {
        const btn = qs(`#event-view-${name}-btn`);
        if (btn) btn.classList.toggle('active', name === view);
    });
}

function openModal(modalId) {
    const modal = qs(`#${modalId}`);
    if (!modal) return;
    modal.style.display = 'flex';
    modal.dataset.open = '1';
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    const modal = qs(`#${modalId}`);
    if (!modal) return;
    modal.style.display = 'none';
    delete modal.dataset.open;
    if (!qs('.modal[data-open="1"]')) document.body.style.overflow = '';
}

function renderEntityParentOptions(editingId) {
    const select = qs('#entity-parent-id');
    if (!select) return;
    
    // 找出所有可以作为父级的实体，优先展示带"分类"标签的
    const cats = entityState.data.filter(e => e.id !== editingId && (e.tags || []).includes('分类'));
    const others = entityState.data.filter(e => e.id !== editingId && !(e.tags || []).includes('分类'));
    
    let html = '<option value="">无（作为根分类）</option>';
    if (cats.length) {
        html += '<optgroup label="预设分类属性实体">';
        html += cats.map(e => `<option value="${e.id}">${e.name} (${e.id})</option>`).join('');
        html += '</optgroup>';
    }
    if (others.length) {
        html += '<optgroup label="其他实体">';
        html += others.map(e => `<option value="${e.id}">${e.name} (${e.id})</option>`).join('');
        html += '</optgroup>';
    }
    
    select.innerHTML = html;
}

function showEntityModal(entityId) {
    const title = qs('#entity-modal-title');
    if (title) title.textContent = entityId ? '编辑实体' : '新建实体';

    const form = qs('#entity-form');
    if (!form) return;
    form.dataset.editingId = entityId || '';

    renderEntityParentOptions(entityId);

    if (entityId) {
        const entity = entityState.data.find((e) => e.id === entityId);
        if (entity) fillEntityForm(entity);
    } else {
        resetEntityForm();
    }
    renderEntityTagSelector();
    openModal('entity-modal');
}

function closeEntityModal() { closeModal('entity-modal'); }

function showEntityImportModal() {
    const fileInput = qs('#entity-import-file');
    if (fileInput) fileInput.value = '';
    openModal('entity-import-modal');
}

function closeEntityImportModal() {
    closeModal('entity-import-modal');
}

function downloadEntityImportTemplate() {
    const headers = ['名称*', '类型*(如:地图/英雄/分类)', '多语言(选填,格式: en:Name)', '主关联ID', '关联对象(多选用分号;分隔)', '别名(多选用分号;分隔)', '描述', '时间描述', '开始时间', '结束时间', '包点配置'];
    const csvContent = '\uFEFF' + headers.join(',') + '\n' + 
        '测试英雄A,英雄,en:Test Hero,分类-101,打野;刺客,测试A;阿测,这是测试描述,常驻,2026/01/01 10:00:00,2026/12/31 23:59:59,\n' +
        'A大,地图,,,防守;交火区,,A大长廊,,,,A点;长廊';
        
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '实体批量导入模板.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function parseCSV(text) {
    const result = [];
    let row = [];
    let inQuotes = false;
    let val = '';
    for (let i = 0; i < text.length; i++) {
        let char = text[i];
        if (char === '"') {
            if (inQuotes && text[i+1] === '"') {
                val += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            row.push(val);
            val = '';
        } else if ((char === '\n' || char === '\r') && !inQuotes) {
            if (char === '\r' && text[i+1] === '\n') i++;
            row.push(val);
            result.push(row);
            row = [];
            val = '';
        } else {
            val += char;
        }
    }
    if (row.length || val) {
        row.push(val);
        result.push(row);
    }
    return result;
}

function showFactImportModal() {
    const fileInput = qs('#fact-import-modal input[type="file"]');
    if (fileInput) fileInput.value = '';
    openModal('fact-import-modal');
}

function closeFactImportModal() {
    closeModal('fact-import-modal');
}

function downloadFactImportTemplate() {
    const headers = ['标题*', '事实内容*', '关联实体ID(分号分隔)', '关联事件ID(分号分隔)', '事实分类', '来源类型', '来源描述', '来源原文片段', '来源URL', '时间描述', '开始时间', '结束时间'];
    const csvContent = '\uFEFF' + headers.join(',') + '\n' + 
        '测试标题,测试的事实内容文本,1001;1002,10150,英雄相关,官方公告,测试公告,这是测试公告的原文...,https://example.com,长驻,2026/01/01 00:00:00,2026/12/31 23:59:59';
        
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '事实批量导入模板.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function processFactImport() {
    const fileInput = qs('#fact-import-file');
    if (!fileInput || !fileInput.files.length) {
        alert('请选择要上传的CSV文件');
        return;
    }
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const rows = parseCSV(text);
        if (rows.length < 2) {
            alert('文件为空或格式错误');
            return;
        }
        
        let importedCount = 0;
        let lastId = factState.data.length ? Math.max(...factState.data.map(f => parseInt(f.id, 10) || 0)) : 50000;
        if (lastId < 50000) lastId = 50000;

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length < 2) continue; // skip empty rows
            
            const title = (row[0] || '').trim();
            const factText = (row[1] || '').trim();
            const entityIdsStr = (row[2] || '').trim();
            const eventIdsStr = (row[3] || '').trim();
            const categoryName = (row[4] || '').trim();
            const sourceType = (row[5] || '').trim();
            const source = (row[6] || '').trim();
            const sourceContent = (row[7] || '').trim();
            const sourceUrl = (row[8] || '').trim();
            const timeDesc = (row[9] || '').trim();
            const startTime = (row[10] || '').trim();
            const endTime = (row[11] || '').trim();

            if (!title || !factText) continue; // must have title and factText
            
            lastId++;
            const newFact = {
                id: lastId,
                title: title,
                factText: factText,
                entityIds: entityIdsStr ? entityIdsStr.split(';').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id)) : [],
                eventIds: eventIdsStr ? eventIdsStr.split(';').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id)) : [],
                categoryId: categoryName ? (factState.categories.find(c => c.name === categoryName)?.id || null) : null,
                sourceType: sourceType,
                source: source,
                sourceContent: sourceContent,
                sourceUrl: sourceUrl,
                timeDescription: timeDesc,
                startTime: startTime,
                endTime: endTime,
                reviewStatus: 'pending',
                uploadStatus: 'pending',
                lang: factState.currentLang,
                createdAt: nowDateTime()
            };

            ensureAuditFieldsForRecord(newFact);
            factState.data.push(newFact);
            importedCount++;
        }

        if (importedCount > 0) {
            appendOperationLog('facts', '批量导入事实', `Batch`, `${importedCount}项`, `成功导入${importedCount}条事实记录`);
            renderFactStats();
            searchFacts();
            alert(`成功导入 ${importedCount} 条事实记录！`);
            closeFactImportModal();
        } else {
            alert('未找到有效的数据行（可能缺少必填字段: 标题和内容）');
        }
    };
    reader.readAsText(file);
}

function processEntityImport() {
    const fileInput = qs('#entity-import-file');
    if (!fileInput || !fileInput.files.length) {
        alert('请选择要上传的CSV文件');
        return;
    }
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const rows = parseCSV(text);
        if (rows.length < 2) {
            alert('文件为空或格式错误');
            return;
        }
        
        let importedCount = 0;
        let lastId = entityState.data.length ? Math.max(...entityState.data.map(e => parseInt(e.id, 10) || 0)) : 1000;
        if (lastId < 1000) lastId = 1000;

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length < 2) continue; // skip empty rows
            
            const name = (row[0] || '').trim();
            const type = (row[1] || '').trim();
            const langStr = (row[2] || '').trim();
            const parentId = (row[3] || '').trim();
            const tagsStr = (row[4] || '').trim();
            const aliasesStr = (row[5] || '').trim();
            const description = (row[6] || '').trim();
            const timeDesc = (row[7] || '').trim();
            const startTime = (row[8] || '').trim();
            const endTime = (row[9] || '').trim();
            const mapPoints = (row[10] || '').trim();

            if (!name || !type) continue; // must have name and type
            
            lastId++;
            const newEntity = {
                id: lastId.toString(),
                name: name,
                type: type,
                parentId: parentId || null,
                tags: Array.from(new Set([type, ...tagsStr.split(';').map(x=>x.trim()).filter(Boolean)])),
                aliases: aliasesStr.split(';').map(x=>x.trim()).filter(Boolean),
                description: description,
                timeDescription: timeDesc,
                startTime: startTime,
                endTime: endTime,
                mapPoints: type === '地图' ? mapPoints : '',
                lang: 'zh',
                reviewStatus: 'pending',
                updatedAt: nowDateTime(),
                updatedBy: CURRENT_USER
            };

            if (langStr) {
                const langParts = langStr.split(';');
                langParts.forEach(lp => {
                    const [langCode, langName] = lp.split(':');
                    if (langCode && langName) {
                        newEntity[`name_${langCode.trim()}`] = langName.trim();
                    }
                });
            }

            entityState.data.push(newEntity);
            importedCount++;
        }

        alert(`成功导入 ${importedCount} 个实体`);
        closeEntityImportModal();
        searchEntities();
    };
    reader.readAsText(file);
}

function showEventModal(eventId) {
    const title = qs('#event-modal-title');
    const form = qs('#event-form');
    if (!form) return;
    form.dataset.editingId = eventId || '';
    if (title) title.textContent = eventId ? '编辑事件' : '新建事件';

    if (eventId) fillEventForm(eventState.data.find((e) => e.id === eventId));
    else resetEventForm();

    switchEventLangTab('zh');
    renderEventTypeSelector();
    openModal('event-modal');
}
function closeEventModal() { closeModal('event-modal'); }
function showFactModal(factId) {

    const title = qs('#fact-modal-title');
    const form = qs('#fact-form');
    if (!form) return;
    form.dataset.editingId = factId || '';
    if (title) title.textContent = factId ? '编辑事实' : '新建事实';

    if (factId) fillFactForm(factState.data.find((f) => f.id === factId));
    else resetFactForm();

    switchFactLangTab('zh');
    renderFactCategoryOptions();
    renderFactEntitySelector();
    renderFactEventSelector();
    openModal('fact-modal');
}

function closeFactModal() { closeModal('fact-modal'); }


function fillEntityForm(entity) {
    qs('#entity-id').value = entity.id;
    qs('#entity-name').value = entity.name || '';
    qs('#entity-parent-id').value = entity.parentId || '';
    qs('#entity-aliases').value = (entity.aliases || []).join('\n');
    qs('#entity-description').value = entity.description || '';
    qs('#entity-time-description').value = entity.timeDescription || '';
    qs('#entity-start-time').value = entity.startTime || '';
    qs('#entity-end-time').value = entity.endTime || '';
    qs('#entity-review-status').value = entity.reviewStatus || 'pending';

    entityState.selectedFormTags = new Set(entity.tags || []);
    const tagsHidden = qs('#entity-tags');
    if (tagsHidden) tagsHidden.value = Array.from(entityState.selectedFormTags).join(',');
}

function resetEntityForm() {
    ['entity-id', 'entity-parent-id', 'entity-name', 'entity-aliases', 'entity-description', 'entity-time-description', 'entity-start-time', 'entity-end-time'].forEach((id) => {
        const el = qs(`#${id}`);
        if (el) el.value = '';
    });
    const review = qs('#entity-review-status');
    if (review) review.value = 'pending';
    entityState.selectedFormTags = new Set();
    const tagsHidden = qs('#entity-tags');
    if (tagsHidden) tagsHidden.value = '';
}

function renderEventTypeSelector() {
    const list = qs('#event-type-list');
    const selected = qs('#event-type-selected');
    const hidden = qs('#event-type');
    if (!list || !selected || !hidden) return;
    const kw = (qs('#event-type-search')?.value || '').trim().toLowerCase();
    const tags = Array.from(new Set(eventState.data.flatMap((e) => e.eventTags || []))).filter((t) => !kw || t.toLowerCase().includes(kw));

    list.innerHTML = tags.map((t) => {
        const active = eventState.selectedFormTags.has(t);
        return `<div style="padding:6px 8px;cursor:pointer;border-radius:6px;margin-bottom:4px;${active ? 'background:#e8ecff;color:#3f51b5;' : ''}" onclick="toggleEventFormTag('${t}')">${active ? '✓ ' : ''}${t}</div>`;
    }).join('') || '<div style="color:#999;">暂无标签</div>';

    selected.innerHTML = Array.from(eventState.selectedFormTags).map((t) => `<span style="display:inline-block;background:#667eea;color:#fff;border-radius:12px;padding:4px 8px;margin:0 6px 6px 0;font-size:12px;">${t}</span>`).join('') || '<span style="color:#999;">未选择</span>';
    hidden.value = Array.from(eventState.selectedFormTags).join(',');
}

function toggleEventFormTag(tag) {
    if (eventState.selectedFormTags.has(tag)) eventState.selectedFormTags.delete(tag);
    else eventState.selectedFormTags.add(tag);
    renderEventTypeSelector();
}

function filterEventTypes() {
    renderEventTypeSelector();
}

function fillEventForm(event) {
    if (!event) return;
    qs('#event-id').value = event.id || '';
    qs('#event-name').value = event.name || '';
    qs('#event-aliases').value = (event.aliases || []).join('\n');
    qs('#event-time-description').value = event.timeDescription || '';
    qs('#event-start-time').value = toInputDateTime(event.startTime || '');
    qs('#event-end-time').value = toInputDateTime(event.endTime || '');
    qs('#event-source-url').value = event.sourceUrl || '';

    eventState.selectedFormTags = new Set(event.eventTags || []);
}

function resetEventForm() {
    ['event-id', 'event-name', 'event-aliases', 'event-time-description', 'event-start-time', 'event-end-time', 'event-source-url', 'event-type-search'].forEach((id) => {
        const el = qs(`#${id}`);
        if (el) el.value = '';
    });
    eventState.selectedFormTags = new Set();
    const hidden = qs('#event-type');
    if (hidden) hidden.value = '';
}

function switchLangTab(prefix, lang) {

    const container = qs(`#${prefix}-modal`);
    if (!container) return;
    qsa('.lang-tab', container).forEach((tab) => {
        const hit = tab.getAttribute('onclick')?.includes(`'${lang}'`);
        tab.classList.toggle('active', !!hit);
    });
    qsa('.lang-tab-content', container).forEach((panel) => {
        const isMatch = panel.id === `${prefix}-lang-${lang}`;
        panel.classList.toggle('active', isMatch);
        panel.style.display = isMatch ? 'block' : 'none';
    });
}

function switchEntityLangTab(lang) { switchLangTab('entity', lang); }
function switchEventLangTab(lang) { switchLangTab('event', lang); }
function switchFactLangTab(lang) { switchLangTab('fact', lang); }

function renderStats() {
    const statEntities = qs('#stat-entities');
    const statEvents = qs('#stat-events');
    const statFacts = qs('#stat-facts');
    if (statEntities) statEntities.textContent = entityState.data.length;
    if (statEvents) statEvents.textContent = eventState.data.length;
    if (statFacts) statFacts.textContent = factState.data.length;
}



function renderEntityTagOptions() {
    const select = qs('#entity-tag-filter');
    if (!select) return;
    select.innerHTML = '<option value="">所有标签</option>' + getAllTags().map((t) => `<option value="${t}">${t}</option>`).join('');
}

function renderEntityTagSelector() {
    const list = qs('#entity-tags-list');
    const selectedBox = qs('#entity-tags-selected');
    const hidden = qs('#entity-tags');
    if (!list || !selectedBox || !hidden) return;

    const kw = (qs('#entity-tags-search')?.value || '').trim().toLowerCase();
    const tags = getAllTags().filter((t) => !kw || t.toLowerCase().includes(kw));

    list.innerHTML = tags.map((t) => {
        const selected = entityState.selectedFormTags.has(t);
        return `<div style="padding:6px 8px;cursor:pointer;border-radius:6px;margin-bottom:4px;${selected ? 'background:#e8ecff;color:#3f51b5;' : ''}" onclick="toggleEntityFormTag('${t}')">${selected ? '✓ ' : ''}${t}</div>`;
    }).join('') || '<div style="color:#999;">暂无标签</div>';

    selectedBox.innerHTML = Array.from(entityState.selectedFormTags).map((t) => `<span style="display:inline-block;background:#667eea;color:#fff;border-radius:12px;padding:4px 8px;margin:0 6px 6px 0;font-size:12px;">${t}</span>`).join('') || '<span style="color:#999;">未选择</span>';
    hidden.value = Array.from(entityState.selectedFormTags).join(',');
}

function toggleEntityFormTag(tag) {
    if (entityState.selectedFormTags.has(tag)) entityState.selectedFormTags.delete(tag);
    else entityState.selectedFormTags.add(tag);
    renderEntityTagSelector();
}

function filterEntityTags() {
    renderEntityTagSelector();
}

function searchEntities() {
    const keyword = (qs('#entity-search')?.value || '').trim().toLowerCase();
    const lang = qs('#entity-language-filter')?.value || '';
    const tag = qs('#entity-tag-filter')?.value || '';
    const review = qs('#entity-review-filter')?.value || '';

    entityState.search = keyword;
    entityState.lang = lang;
    entityState.tag = tag;
    entityState.review = review;

    entityState.filtered = entityState.data.filter((e) => {
        if (lang && e.lang !== lang) return false;
        if (tag && !(e.tags || []).includes(tag)) return false;
        if (review && e.reviewStatus !== review) return false;
        if (!keyword) return true;
        const text = [e.id, e.name, (e.aliases || []).join(','), e.description, e.timeDescription, e.startTime, e.endTime].join(' ').toLowerCase();
        return text.includes(keyword);
    }).sort((a, b) => a.id - b.id);


    entityState.page = 1;
    renderEntitiesTable();
    renderEntityTree();
    refreshEntityNetworkVisibility();
}

function renderEntitiesTable() {
    const tbody = qs('#entities-tbody');
    if (!tbody) return;

    const total = entityState.filtered.length;
    const start = (entityState.page - 1) * entityState.pageSize;
    const pageItems = entityState.filtered.slice(start, start + entityState.pageSize);

    if (!pageItems.length) {
        tbody.innerHTML = '<tr><td colspan="10" class="loading">暂无数据</td></tr>';
    } else {
        tbody.innerHTML = pageItems.map((e) => renderEntityRow(e)).join('');
    }


    renderEntityPagination(total);
    updateEntitySelectionUI();
}

function renderEntityRow(e) {
    const tagsHtml = (e.tags || []).map((t) => `<span style="display:inline-block;background:#e8ecff;color:#3f51b5;padding:3px 8px;border-radius:12px;margin-right:4px;font-size:12px;">${t}</span>`).join('');
    const reviewMap = {
        approved: { text: '已审核', color: '#2ecc71' },
        pending: { text: '待审核', color: '#f1c40f' }
    };
    const review = reviewMap[e.reviewStatus] || reviewMap.pending;
    const checked = entityState.selected.has(e.id) ? 'checked' : '';

    return `
        <tr>
            <td><input type="checkbox" ${checked} onchange="toggleEntitySelect(${e.id}, this)"></td>
            <td>${e.id}</td>
            <td>${e.name}</td>
            <td>${tagsHtml || '-'}</td>
            <td><span style="padding:4px 10px;border-radius:12px;background:${review.color};color:#fff;font-size:12px;">${review.text}</span></td>
            <td>${e.aliases?.length ? e.aliases.join('<br>') : '-'}</td>
            <td><div class="fact-cell-scroll-box">${e.description || '-'}</div></td>
            <td>
                <div style="font-size:12px;line-height:1.4;">
                    <div style="color:#666;margin-bottom:2px;">${e.updatedAt || '-'}</div>
                    <div style="color:#666;">${e.updatedBy || '-'}</div>
                </div>
            </td>
            <td>
                <button class="btn btn-secondary" style="padding:6px 10px;font-size:12px;" onclick="viewEntityHistory(${e.id})">查看记录</button>
                <button class="btn btn-secondary" style="padding:6px 10px;font-size:12px;" onclick="editEntity(${e.id})">编辑</button>
                <button class="btn btn-danger" style="padding:6px 10px;font-size:12px;" onclick="deleteEntity(${e.id})">删除</button>
            </td>

        </tr>

    `;
}

function renderEntityPagination(total) {
    const container = qs('#entities-pagination');
    if (!container) return;
    const pages = Math.ceil(total / entityState.pageSize);
    if (pages <= 1) {
        container.style.display = 'none';
        container.innerHTML = '';
        return;
    }
    container.style.display = 'flex'; container.style.gap = '8px'; container.style.marginTop = '16px';
    container.innerHTML = Array.from({ length: pages }, (_, i) => i + 1)
        .map((page) => `<div class="page-item ${page === entityState.page ? 'active' : 'border'}" onclick="goEntityPage(${page})">${page}</div>`)
        .join('');
}

function goEntityPage(page) {
    entityState.page = page;
    renderEntitiesTable();
}

function renderEventTagOptions() {
    const select = qs('#event-tag-filter');
    if (!select) return;
    const tags = Array.from(new Set(eventState.data.flatMap((e) => e.eventTags || [])));
    select.innerHTML = '<option value="">所有事件类型</option>' + tags.map((t) => `<option value="${t}">${t}</option>`).join('');
}

function searchEvents() {
    const keyword = (qs('#event-search')?.value || '').trim().toLowerCase();
    const lang = qs('#event-language-filter')?.value || '';
    const review = qs('#event-review-filter')?.value || '';
    const tag = qs('#event-tag-filter')?.value || '';
    const sort = qs('#event-sort-filter')?.value || 'event_id:desc';


    eventState.search = keyword;
    eventState.lang = lang;
    eventState.review = review;
    eventState.tag = tag;

    let filtered = eventState.data.filter((e) => {
        if (lang && e.lang !== lang) return false;
        if (review && e.reviewStatus !== review) return false;
        if (tag && !(e.eventTags || []).includes(tag)) return false;
        if (!keyword) return true;
        const text = [e.id, e.name, (e.aliases || []).join(','), (e.eventTags || []).join(','), e.timeDescription, e.source, e.startTime, e.endTime].join(' ').toLowerCase();
        return text.includes(keyword);
    });

    const [field, direction] = sort.split(':');
    const getSortValue = (item) => {
        if (field === 'event_id' || field === 'created_at') return item.id;
        if (field === 'start_time') return item.startTime || '';
        return item.id;
    };
    filtered = filtered.sort((a, b) => {
        const av = getSortValue(a);
        const bv = getSortValue(b);
        if (typeof av === 'number' && typeof bv === 'number') {
            return direction === 'asc' ? av - bv : bv - av;
        }
        if (direction === 'asc') return String(av).localeCompare(String(bv), 'zh');
        return String(bv).localeCompare(String(av), 'zh');
    });


    eventState.filtered = filtered;
    eventState.page = 1;
    renderEventsTable();
}

function renderEventsTable() {
    const tbody = qs('#events-tbody');
    if (!tbody) return;

    const total = eventState.filtered.length;
    const start = (eventState.page - 1) * eventState.pageSize;
    const items = eventState.filtered.slice(start, start + eventState.pageSize);

    if (!items.length) {
        tbody.innerHTML = '<tr><td colspan="13" class="loading">暂无数据</td></tr>';
    } else {
        tbody.innerHTML = items.map((e) => renderEventRow(e)).join('');
    }

    renderEventsPagination(total);
}

function renderEventRow(e) {
    const reviewMap = {
        approved: { text: '已审核', color: '#2ecc71' },
        pending: { text: '待审核', color: '#f1c40f' }
    };
    const review = reviewMap[e.reviewStatus] || reviewMap.pending;
    return `
        <tr>
            <td><input type="checkbox"></td>
            <td>${e.id}</td>
            <td>${e.name}</td>
            <td>${e.aliases?.join('<br>') || '-'}</td>
            <td>${(e.eventTags || []).map((t) => `<span style="display:inline-block;background:#e8ecff;color:#3f51b5;padding:3px 8px;border-radius:12px;margin-right:4px;font-size:12px;">${t}</span>`).join('')}</td>
            <td><span style="padding:4px 10px;border-radius:12px;background:${review.color};color:#fff;font-size:12px;">${review.text}</span></td>
            <td>${e.startTime || '-'}</td>
            <td>${e.endTime || '-'}</td>
            <td><div class="fact-cell-scroll-box fact-cell-scroll-box-sm">${e.timeDescription || '-'}</div></td>
            <td>${e.source || '-'}</td>
            <td>
                <div style="font-size:12px;line-height:1.4;">
                    <div style="color:#666;margin-bottom:2px;">${e.updatedAt || '-'}</div>
                    <div style="color:#666;">${e.updatedBy || '-'}</div>
                </div>
            </td>
            <td>
                <button class="btn btn-secondary" style="padding:6px 10px;font-size:12px;" onclick="viewEventHistory(${e.id})">查看记录</button>
                <button class="btn btn-secondary" style="padding:6px 10px;font-size:12px;" onclick="showEventModal(${e.id})">编辑</button>
                <button class="btn btn-danger" style="padding:6px 10px;font-size:12px;" onclick="deleteEvent(${e.id})">删除</button>
            </td>

        </tr>
    `;
}

function renderEventsPagination(total) {
    const container = qs('#events-pagination');
    if (!container) return;
    const pages = Math.ceil(total / eventState.pageSize);
    if (pages <= 1) {
        container.style.display = 'none';
        container.innerHTML = '';
        return;
    }
    container.style.display = 'flex'; container.style.gap = '8px'; container.style.marginTop = '16px';
    container.innerHTML = Array.from({ length: pages }, (_, i) => i + 1)
        .map((page) => `<div class="page-item ${page === eventState.page ? 'active' : 'border'}" onclick="goEventPage(${page})">${page}</div>`)
        .join('');
}

function goEventPage(page) {
    eventState.page = page;
    renderEventsTable();
}

function handleEventSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const editingId = Number(form.dataset.editingId || 0);
    const name = qs('#event-name')?.value.trim();
    if (!name) return alert('事件名称不能为空');

    const oldEvent = editingId ? eventState.data.find((x) => x.id === editingId) : null;
    const payload = {
        name,
        aliases: (qs('#event-aliases')?.value || '').split(/\n+/).map((x) => x.trim()).filter(Boolean),
        eventTags: Array.from(eventState.selectedFormTags),
        reviewStatus: oldEvent?.reviewStatus || 'pending',
        startTime: toDisplayDateTime(qs('#event-start-time')?.value || ''),

        endTime: toDisplayDateTime(qs('#event-end-time')?.value || ''),
        timeDescription: qs('#event-time-description')?.value.trim() || '',
        source: qs('#event-source-url')?.value.trim() || '',
        sourceUrl: qs('#event-source-url')?.value.trim() || '',
        lang: qs('#event-language-filter')?.value || 'zh',
        updatedAt: nowDateTime(),
        updatedBy: CURRENT_USER
    };

    if (editingId) {
        const idx = eventState.data.findIndex((x) => x.id === editingId);
        if (idx >= 0) {
            eventState.data[idx] = { ...eventState.data[idx], ...payload };
            appendOperationLog('events', '编辑', editingId, payload.name, '更新事件信息');
        }
    } else {
        const newId = Math.max(0, ...eventState.data.map((x) => x.id)) + 1;
        eventState.data.unshift({ id: newId, ...payload });
        appendOperationLog('events', '新建', newId, payload.name, '创建事件');
    }

    closeEventModal();
    renderStats();
    renderEventTagOptions();
    searchEvents();
}

function deleteEvent(id) {
    const target = eventState.data.find((e) => e.id === id);
    eventState.data = eventState.data.filter((e) => e.id !== id);
    eventState.filtered = eventState.filtered.filter((e) => e.id !== id);
    appendOperationLog('events', '删除', id, target?.name || '-', '删除事件');
    renderStats();
    renderEventTagOptions();
    searchEvents();
}

function parseFactIds(text) {

    return (text || '').split(',').map((x) => Number(x.trim())).filter((x) => Number.isInteger(x) && x > 0);
}

function toDisplayDateTime(value) {
    if (!value) return '';
    if (value.includes('T')) return value.replace('T', ' ').slice(0, 19);
    return value;
}

function toInputDateTime(value) {
    if (!value) return '';
    if (value.includes('T')) return value.slice(0, 19);
    const [date, time = '00:00:00'] = value.split(' ');
    return `${date.replace(/\//g, '-') }T${time}`;
}

function getFactCategoryChildren(parentId) {
    return factState.categories.filter((c) => c.parentId === parentId);
}

function getFactCategoryDescendantIds(parentId) {
    const all = new Set([parentId]);
    const stack = [parentId];
    while (stack.length) {
        const cur = stack.pop();
        getFactCategoryChildren(cur).forEach((child) => {
            all.add(child.id);
            stack.push(child.id);
        });
    }
    return all;
}

function getFactCategoryPath(categoryId) {
    if (!categoryId) return '全部分类';
    const path = [];
    let cur = factState.categories.find((c) => c.id === categoryId);
    while (cur) {
        path.unshift(cur.name);
        cur = cur.parentId ? factState.categories.find((c) => c.id === cur.parentId) : null;
    }
    return path.join(' / ') || '全部分类';
}

function setFactCurrentCategory(categoryId) {
    factState.currentCategoryId = categoryId || null;
    const current = qs('#fact-category-current');
    if (current) current.textContent = `当前：${getFactCategoryPath(factState.currentCategoryId)}`;
    searchFacts();
    renderFactCategoryTree();
}

function renderFactCategoryTree() {
    const container = qs('#fact-category-tree-container');
    if (!container) return;

    const renderNode = (node, level) => {
        const children = getFactCategoryChildren(node.id);
        const hasChildren = children.length > 0;
        const expanded = factState.expandedCategories.has(node.id);
        const active = factState.currentCategoryId === node.id;
        const row = `
            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 8px 6px ${8 + level * 18}px;border-radius:6px;${active ? 'background:#e8ecff;' : ''}">
                <div style="display:flex;align-items:center;gap:6px;min-width:0;">
                    <span style="cursor:${hasChildren ? 'pointer' : 'default'};width:14px;color:#666;" onclick="toggleFactCategoryExpand(${node.id})">${hasChildren ? (expanded ? '▼' : '▶') : '•'}</span>
                    <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer;" onclick="setFactCurrentCategory(${node.id})">${node.name}</span>
                </div>
            </div>
        `;
        if (!hasChildren || !expanded) return row;
        return row + children.map((child) => renderNode(child, level + 1)).join('');
    };

    const roots = factState.categories.filter((c) => c.parentId === null);
    container.innerHTML = `
        <div style="padding:6px 8px;border-radius:6px;cursor:pointer;${factState.currentCategoryId === null ? 'background:#e8ecff;' : ''}" onclick="setFactCurrentCategory(null)">全部分类</div>
        ${roots.map((node) => renderNode(node, 0)).join('')}
    `;
}

function toggleFactCategoryExpand(categoryId) {
    if (factState.expandedCategories.has(categoryId)) factState.expandedCategories.delete(categoryId);
    else factState.expandedCategories.add(categoryId);
    renderFactCategoryTree();
}

function renderFactCategoryOptions() {
    const select = qs('#fact-category-id');
    if (!select) return;
    const roots = factState.categories.filter((c) => c.parentId === null);
    const flatten = (node, level) => {
        const line = `<option value="${node.id}">${'　'.repeat(level)}${node.name}</option>`;
        return line + getFactCategoryChildren(node.id).map((child) => flatten(child, level + 1)).join('');
    };
    select.innerHTML = '<option value="">无分类</option>' + roots.map((n) => flatten(n, 0)).join('');
}

function createFactCategory() {
    const mode = qs('#fact-category-mode');
    const title = qs('#fact-category-modal-title');
    const parentIdInput = qs('#fact-category-parent-id');
    const parentName = qs('#fact-category-parent-name');
    const nameInput = qs('#fact-category-name');
    const descInput = qs('#fact-category-description');
    const nextIdInput = qs('#fact-category-next-id');
    if (!mode || !title || !parentIdInput || !parentName || !nameInput || !descInput || !nextIdInput) return;

    mode.value = 'create';
    title.textContent = '新建分类';
    parentIdInput.value = '';
    parentName.value = '根分类';
    nameInput.value = '';
    descInput.value = '';
    nextIdInput.value = String(Math.max(0, ...factState.categories.map((c) => c.id)) + 1);
    openModal('fact-category-modal');
}

function closeFactCategoryModal() { closeModal('fact-category-modal'); }
function closeFactCategoryDeleteModal() { closeModal('fact-category-delete-modal'); }
function confirmDeleteFactCategory() { console.info('mock: confirmDeleteFactCategory'); }

function saveFactCategoryModal() {
    const mode = qs('#fact-category-mode')?.value || 'create';
    const id = Number(qs('#fact-category-edit-id')?.value || 0);
    const parentIdRaw = qs('#fact-category-parent-id')?.value;
    const parentId = parentIdRaw ? Number(parentIdRaw) : null;
    const name = qs('#fact-category-name')?.value?.trim();
    const description = qs('#fact-category-description')?.value?.trim() || '';
    if (!name) return alert('分类名称不能为空');

    if (mode === 'edit' && id) {
        const idx = factState.categories.findIndex((c) => c.id === id);
        if (idx >= 0) factState.categories[idx] = { ...factState.categories[idx], name, description, parentId };
        appendOperationLog('facts', '编辑分类', id, name, '更新事实分类');
    } else {
        const newId = Math.max(0, ...factState.categories.map((c) => c.id)) + 1;
        factState.categories.push({ id: newId, parentId, name, description });
        appendOperationLog('facts', '新建分类', newId, name, '创建事实分类');
    }

    closeFactCategoryModal();
    renderFactCategoryOptions();
    renderFactCategoryTree();
}


function loadFactCategories() {
    renderFactCategoryTree();
    renderFactCategoryOptions();
}

function renderFactEntitySelector() {
    const list = qs('#fact-entities-list');
    const selected = qs('#fact-entities-selected');
    const hidden = qs('#fact-entity-ids');
    if (!list || !selected || !hidden) return;
    const kw = (qs('#fact-entities-search')?.value || '').trim().toLowerCase();

    const items = entityState.data.filter((e) => !kw || `${e.id} ${e.name}`.toLowerCase().includes(kw));
    list.innerHTML = items.map((e) => {
        const checked = factState.selectedEntityIds.has(e.id);
        return `<div style="padding:6px 8px;border-radius:6px;cursor:pointer;${checked ? 'background:#e8ecff;color:#3f51b5;' : ''}" onclick="toggleFactEntity(${e.id})">${checked ? '✓ ' : ''}${e.id} - ${e.name}</div>`;
    }).join('') || '<div style="color:#999;">暂无实体</div>';

    selected.innerHTML = Array.from(factState.selectedEntityIds)
        .map((id) => entityState.data.find((e) => e.id === id))
        .filter(Boolean)
        .map((e) => `<span style="display:inline-block;background:#667eea;color:#fff;border-radius:12px;padding:4px 8px;margin:0 6px 6px 0;font-size:12px;">${e.name}</span>`)
        .join('') || '<span style="color:#999;">未选择</span>';

    hidden.value = Array.from(factState.selectedEntityIds).join(',');
}

function renderFactEventSelector() {
    const list = qs('#fact-events-list');
    const selected = qs('#fact-events-selected');
    const hidden = qs('#fact-event-ids');
    if (!list || !selected || !hidden) return;
    const kw = (qs('#fact-events-search')?.value || '').trim().toLowerCase();

    const items = eventState.data.filter((e) => !kw || `${e.id} ${e.name}`.toLowerCase().includes(kw));
    list.innerHTML = items.map((e) => {
        const checked = factState.selectedEventIds.has(e.id);
        return `<div style="padding:6px 8px;border-radius:6px;cursor:pointer;${checked ? 'background:#e8ecff;color:#3f51b5;' : ''}" onclick="toggleFactEvent(${e.id})">${checked ? '✓ ' : ''}${e.id} - ${e.name}</div>`;
    }).join('') || '<div style="color:#999;">暂无事件</div>';

    selected.innerHTML = Array.from(factState.selectedEventIds)
        .map((id) => eventState.data.find((e) => e.id === id))
        .filter(Boolean)
        .map((e) => `<span style="display:inline-block;background:#26a69a;color:#fff;border-radius:12px;padding:4px 8px;margin:0 6px 6px 0;font-size:12px;">${e.name}</span>`)
        .join('') || '<span style="color:#999;">未选择</span>';

    hidden.value = Array.from(factState.selectedEventIds).join(',');
}

function toggleFactEntity(id) {
    if (factState.selectedEntityIds.has(id)) factState.selectedEntityIds.delete(id);
    else factState.selectedEntityIds.add(id);
    renderFactEntitySelector();
}

function toggleFactEvent(id) {
    if (factState.selectedEventIds.has(id)) factState.selectedEventIds.delete(id);
    else factState.selectedEventIds.add(id);
    renderFactEventSelector();
}

function filterFactEntities() { renderFactEntitySelector(); }
function filterFactEvents() { renderFactEventSelector(); }

function renderFactBatchEntitySelector() {
    const list = qs('#fact-batch-edit-entities-list');
    const selected = qs('#fact-batch-edit-entities-selected');
    if (!list || !selected) return;
    const kw = (qs('#fact-batch-edit-entities-search')?.value || '').trim().toLowerCase();
    const items = entityState.data.filter((e) => !kw || `${e.id} ${e.name}`.toLowerCase().includes(kw));

    list.innerHTML = items.map((e) => {
        const checked = factState.batchSelectedEntityIds.has(e.id);
        return `<div style="padding:6px 8px;border-radius:6px;cursor:pointer;${checked ? 'background:#e8ecff;color:#3f51b5;' : ''}" onclick="toggleFactBatchEntity(${e.id})">${checked ? '✓ ' : ''}${e.id} - ${e.name}</div>`;
    }).join('') || '<div style="color:#999;">暂无实体</div>';

    selected.innerHTML = Array.from(factState.batchSelectedEntityIds)
        .map((id) => entityState.data.find((e) => e.id === id))
        .filter(Boolean)
        .map((e) => `<span style="display:inline-block;background:#667eea;color:#fff;border-radius:12px;padding:4px 8px;margin:0 6px 6px 0;font-size:12px;">${e.name}</span>`)
        .join('') || '<span style="color:#999;">未选择</span>';
}

function renderFactBatchEventSelector() {
    const list = qs('#fact-batch-edit-events-list');
    const selected = qs('#fact-batch-edit-events-selected');
    if (!list || !selected) return;
    const kw = (qs('#fact-batch-edit-events-search')?.value || '').trim().toLowerCase();
    const items = eventState.data.filter((e) => !kw || `${e.id} ${e.name}`.toLowerCase().includes(kw));

    list.innerHTML = items.map((e) => {
        const checked = factState.batchSelectedEventIds.has(e.id);
        return `<div style="padding:6px 8px;border-radius:6px;cursor:pointer;${checked ? 'background:#e8ecff;color:#3f51b5;' : ''}" onclick="toggleFactBatchEvent(${e.id})">${checked ? '✓ ' : ''}${e.id} - ${e.name}</div>`;
    }).join('') || '<div style="color:#999;">暂无事件</div>';

    selected.innerHTML = Array.from(factState.batchSelectedEventIds)
        .map((id) => eventState.data.find((e) => e.id === id))
        .filter(Boolean)
        .map((e) => `<span style="display:inline-block;background:#26a69a;color:#fff;border-radius:12px;padding:4px 8px;margin:0 6px 6px 0;font-size:12px;">${e.name}</span>`)
        .join('') || '<span style="color:#999;">未选择</span>';
}

function toggleFactBatchEntity(id) {
    if (factState.batchSelectedEntityIds.has(id)) factState.batchSelectedEntityIds.delete(id);
    else factState.batchSelectedEntityIds.add(id);
    renderFactBatchEntitySelector();
}

function toggleFactBatchEvent(id) {
    if (factState.batchSelectedEventIds.has(id)) factState.batchSelectedEventIds.delete(id);
    else factState.batchSelectedEventIds.add(id);
    renderFactBatchEventSelector();
}

function filterFactBatchEditEntities() { renderFactBatchEntitySelector(); }
function filterFactBatchEditEvents() { renderFactBatchEventSelector(); }

function fillFactForm(fact) {
    if (!fact) return;
    qs('#fact-id').value = fact.id;
    qs('#fact-title').value = fact.title || '';
    qs('#fact-text').value = fact.factText || '';
    qs('#fact-time-description').value = fact.timeDescription || '';
    qs('#fact-source-type').value = fact.sourceType || '';
    qs('#fact-source').value = fact.source || '';
    qs('#fact-source-url').value = fact.sourceUrl || '';
    qs('#fact-source-content').value = fact.sourceContent || '';
    qs('#fact-start-time').value = toInputDateTime(fact.startTime);
    qs('#fact-end-time').value = toInputDateTime(fact.endTime);
    qs('#fact-review-status').value = fact.reviewStatus || 'pending';
    qs('#fact-contradiction-reason').value = fact.contradictionReason || '';
    qs('#fact-contradicting-fact-ids').value = (fact.contradictingFactIds || []).join(',');
    qs('#fact-duplicate-fact-ids').value = (fact.duplicateFactIds || []).join(',');
    qs('#fact-category-id').value = fact.categoryId || '';

    factState.selectedEntityIds = new Set(fact.entityIds || []);
    factState.selectedEventIds = new Set(fact.eventIds || []);
}

function resetFactForm() {
    ['fact-id', 'fact-title', 'fact-text', 'fact-time-description', 'fact-source-type', 'fact-source', 'fact-source-url', 'fact-source-content', 'fact-start-time', 'fact-end-time', 'fact-contradiction-reason', 'fact-contradicting-fact-ids', 'fact-duplicate-fact-ids'].forEach((id) => {
        const el = qs(`#${id}`);
        if (el) el.value = '';
    });
    const review = qs('#fact-review-status');
    if (review) review.value = 'pending';
    const category = qs('#fact-category-id');
    if (category) category.value = '';
    factState.selectedEntityIds = new Set();
    factState.selectedEventIds = new Set();
}

function getFactStatusBadge(status, type) {
    const map = type === 'upload'
        ? {
            pending: { text: '待上传', color: '#f39c12' },
            need_update: { text: '需更新', color: '#e67e22' },
            done: { text: '已上传', color: '#2ecc71' }
        }
        : {
            approved: { text: '已审核', color: '#2ecc71' },
            pending: { text: '待审核', color: '#f1c40f' }
        };
    const item = map[status] || map.pending;
    return `<span style="padding:4px 10px;border-radius:12px;background:${item.color};color:#fff;font-size:12px;">${item.text}</span>`;
}

function getEntityNames(ids) {
    return (ids || []).map((id) => entityState.data.find((e) => e.id === id)?.name || id).join('、');
}

function getEventNames(ids) {
    return (ids || []).map((id) => eventState.data.find((e) => e.id === id)?.name || id).join('、');
}

function renderFactRow(f) {
    const contradictionInfo = f.contradictionReason
        ? `<div>原因：${f.contradictionReason}</div><div>冲突ID：${(f.contradictingFactIds || []).join(',') || '-'}</div><div>重复ID：${(f.duplicateFactIds || []).join(',') || '-'}</div>`
        : '-';
    const checked = factState.selected.has(f.id) ? 'checked' : '';

    return `
        <tr>
            <td><input type="checkbox" ${checked} onchange="toggleFactSelect(${f.id}, this)"></td>
            <td>${f.id}</td>
            <td>${f.title || '-'}</td>
            <td><div class="fact-cell-scroll-box">${f.factText || '-'}</div></td>
            <td>${getFactStatusBadge(f.reviewStatus, 'review')}</td>
            <td>${getFactStatusBadge(f.uploadStatus, 'upload')}</td>
            <td><div class="fact-cell-scroll-box">${getEntityNames(f.entityIds) || '-'}</div></td>
            <td>${f.sourceType || '-'}</td>
            <td>${f.source || '-'}</td>
            <td><div class="fact-cell-scroll-box">${f.sourceContent || '-'}</div></td>
            <td>${f.startTime || '-'}</td>
            <td>${f.endTime || '-'}</td>
            <td><div class="fact-cell-scroll-box fact-cell-scroll-box-sm">${f.timeDescription || '-'}</div></td>
            <td><div class="fact-cell-scroll-box">${getEventNames(f.eventIds) || '-'}</div></td>
            <td><div class="fact-cell-scroll-box">${contradictionInfo}</div></td>
            <td>
                <div style="font-size:12px;line-height:1.4;">
                    <div style="color:#666;margin-bottom:2px;">${f.updatedAt || '-'}</div>
                    <div style="color:#666;">${f.updatedBy || '-'}</div>
                </div>
            </td>
            <td>
                <button class="btn btn-secondary" style="padding:6px 10px;font-size:12px;" onclick="viewFactHistory(${f.id})">查看记录</button>
                <button class="btn btn-secondary" style="padding:6px 10px;font-size:12px;" onclick="editFact(${f.id})">编辑</button>
                <button class="btn btn-danger" style="padding:6px 10px;font-size:12px;" onclick="deleteFact(${f.id})">删除</button>
            </td>
        </tr>
    `;
}

function renderFactStats() {
    const count = (status) => factState.data.filter((f) => f.reviewStatus === status).length;
    const approved = qs('#fact-stats-approved');
    const pending = qs('#fact-stats-pending');
    const total = qs('#fact-stats-total');
    if (approved) approved.textContent = count('approved');
    if (pending) pending.textContent = count('pending');
    if (total) total.textContent = factState.data.length;
}

function renderFactsPagination(total) {
    const container = qs('#facts-pagination');
    if (!container) return;
    const pages = Math.ceil(total / factState.pageSize);
    if (pages <= 1) {
        container.style.display = 'none';
        container.innerHTML = '';
        return;
    }
    container.style.display = 'flex'; container.style.gap = '8px'; container.style.marginTop = '16px';
    container.innerHTML = Array.from({ length: pages }, (_, i) => i + 1)
        .map((page) => `<div class="page-item ${page === factState.page ? 'active' : 'border'}" onclick="goFactPage(${page})">${page}</div>`)
        .join('');
}

function renderFactsTable() {
    const tbody = qs('#facts-tbody');
    if (!tbody) return;

    const total = factState.filtered.length;
    const start = (factState.page - 1) * factState.pageSize;
    const items = factState.filtered.slice(start, start + factState.pageSize);

    if (!items.length) {
        tbody.innerHTML = '<tr><td colspan="17" class="loading">暂无数据</td></tr>';
    } else {

        tbody.innerHTML = items.map((f) => renderFactRow(f)).join('');
    }

    renderFactsPagination(total);
    updateFactSelectionUI();
}

function searchFacts() {
    const idKeyword = (qs('#fact-id-search')?.value || '').trim();
    const keyword = (qs('#fact-search')?.value || '').trim().toLowerCase();
    const lang = qs('#fact-language-filter')?.value || 'zh';
    const review = qs('#fact-review-filter')?.value || '';
    const upload = qs('#fact-upload-filter')?.value || '';
    const contradiction = qs('#fact-contradiction-filter')?.value || '';

    const categorySet = factState.currentCategoryId ? getFactCategoryDescendantIds(factState.currentCategoryId) : null;

    factState.filtered = factState.data.filter((f) => {
        if (lang && f.lang !== lang) return false;
        if (review && f.reviewStatus !== review) return false;
        if (upload && f.uploadStatus !== upload) return false;
        if (contradiction === 'true' && !f.contradictionReason) return false;
        if (contradiction === 'false' && !!f.contradictionReason) return false;
        if (categorySet && !categorySet.has(f.categoryId)) return false;
        if (idKeyword && !String(f.id).includes(idKeyword)) return false;
        if (!keyword) return true;
        const text = [f.id, f.title, f.factText, f.source, f.sourceContent, f.timeDescription, getEntityNames(f.entityIds), getEventNames(f.eventIds)].join(' ').toLowerCase();
        return text.includes(keyword);
    }).sort((a, b) => b.id - a.id);

    factState.page = 1;
    renderFactsTable();
}

function goFactPage(page) {
    factState.page = page;
    renderFactsTable();
}

function toggleFactSelectAll() {
    const checked = !!qs('#fact-select-all')?.checked;
    factState.selected.clear();
    if (checked) factState.filtered.forEach((f) => factState.selected.add(f.id));
    renderFactsTable();
}

function toggleFactSelect(id, el) {
    if (el.checked) factState.selected.add(id);
    else factState.selected.delete(id);
    updateFactSelectionUI();
}

function updateFactSelectionUI() {
    const count = qs('#fact-selected-count');
    if (count) count.textContent = `已选择 ${factState.selected.size} 项`;
    const bar = qs('#fact-batch-toolbar');
    if (bar) bar.style.display = factState.selected.size ? 'flex' : 'none';
    const all = qs('#fact-select-all');
    if (all) all.checked = factState.filtered.length > 0 && factState.filtered.every((f) => factState.selected.has(f.id));
}

function clearFactSelection() {
    factState.selected.clear();
    updateFactSelectionUI();
    renderFactsTable();
}

function editFact(id) {
    showFactModal(id);
}

function deleteFact(id) {
    const target = factState.data.find((f) => f.id === id);
    factState.data = factState.data.filter((f) => f.id !== id);
    factState.filtered = factState.filtered.filter((f) => f.id !== id);
    factState.selected.delete(id);
    appendOperationLog('facts', '删除', id, target?.title || '-', '删除事实');
    renderStats();
    renderFactStats();
    searchFacts();
}


function handleFactSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const editingId = Number(form.dataset.editingId || 0);
    const factText = qs('#fact-text')?.value.trim();
    if (!factText) return alert('事实内容不能为空');

    const payload = {
        title: qs('#fact-title')?.value.trim() || factText.slice(0, 30),
        factText,
        timeDescription: qs('#fact-time-description')?.value.trim() || '',
        sourceType: qs('#fact-source-type')?.value.trim() || '',
        source: qs('#fact-source')?.value.trim() || '',
        sourceUrl: qs('#fact-source-url')?.value.trim() || '',
        sourceContent: qs('#fact-source-content')?.value.trim() || '',
        startTime: toDisplayDateTime(qs('#fact-start-time')?.value || ''),
        endTime: toDisplayDateTime(qs('#fact-end-time')?.value || ''),
        reviewStatus: qs('#fact-review-status')?.value || 'pending',
        uploadStatus: 'pending',
        contradictionReason: qs('#fact-contradiction-reason')?.value.trim() || '',
        contradictingFactIds: parseFactIds(qs('#fact-contradicting-fact-ids')?.value || ''),
        duplicateFactIds: parseFactIds(qs('#fact-duplicate-fact-ids')?.value || ''),
        entityIds: Array.from(factState.selectedEntityIds),
        eventIds: Array.from(factState.selectedEventIds),
        categoryId: Number(qs('#fact-category-id')?.value || 0) || null,
        lang: qs('#fact-language-filter')?.value || 'zh',
        updatedAt: nowDateTime(),
        updatedBy: CURRENT_USER
    };

    if (editingId) {
        const idx = factState.data.findIndex((f) => f.id === editingId);
        if (idx >= 0) {
            factState.data[idx] = { ...factState.data[idx], ...payload };
            appendOperationLog('facts', '编辑', editingId, payload.title, '更新事实');
        }
    } else {
        const newId = Math.max(0, ...factState.data.map((f) => f.id)) + 1;
        factState.data.unshift({ id: newId, ...payload });
        appendOperationLog('facts', '新建', newId, payload.title, '创建事实');
    }


    closeFactModal();
    renderStats();
    renderFactStats();
    searchFacts();
}

function batchUpdateFactReviewStatus() {
    if (!factState.selected.size) return;
    const status = qs('#fact-batch-review-status')?.value || 'pending';
    
    factState.data = factState.data.map((f) => factState.selected.has(f.id) ? { ...f, reviewStatus: status } : f);
    
    renderFactStats();
    searchFacts();
}

function showFactBatchEditModal() {
    factState.batchSelectedEntityIds = new Set();
    factState.batchSelectedEventIds = new Set();
    ['fact-batch-edit-source-type', 'fact-batch-edit-source', 'fact-batch-edit-source-url', 'fact-batch-edit-source-content', 'fact-batch-edit-entities-search', 'fact-batch-edit-events-search'].forEach((id) => {
        const el = qs(`#${id}`);
        if (el) el.value = '';
    });
    renderFactBatchEntitySelector();
    renderFactBatchEventSelector();
    openModal('fact-batch-edit-modal');
}

function closeFactBatchEditModal() { closeModal('fact-batch-edit-modal'); }

function saveFactBatchEdit() {
    if (!factState.selected.size) return closeFactBatchEditModal();

    const sourceType = qs('#fact-batch-edit-source-type')?.value.trim() || '';
    const source = qs('#fact-batch-edit-source')?.value.trim() || '';
    const sourceUrl = qs('#fact-batch-edit-source-url')?.value.trim() || '';
    const sourceContent = qs('#fact-batch-edit-source-content')?.value.trim() || '';
    const entityMode = qs('#fact-batch-edit-entity-mode')?.value || 'add';
    const eventMode = qs('#fact-batch-edit-event-mode')?.value || 'add';

    factState.data = factState.data.map((f) => {
        if (!factState.selected.has(f.id)) return f;
        const next = { ...f };
        if (sourceType) next.sourceType = sourceType;
        if (source) next.source = source;
        if (sourceUrl) next.sourceUrl = sourceUrl;
        if (sourceContent) next.sourceContent = sourceContent;

        if (factState.batchSelectedEntityIds.size) {
            const incoming = Array.from(factState.batchSelectedEntityIds);
            next.entityIds = entityMode === 'replace' ? incoming : Array.from(new Set([...(next.entityIds || []), ...incoming]));
        }

        if (factState.batchSelectedEventIds.size) {
            const incoming = Array.from(factState.batchSelectedEventIds);
            next.eventIds = eventMode === 'replace' ? incoming : Array.from(new Set([...(next.eventIds || []), ...incoming]));
        }

        next.updatedAt = nowDateTime();
        next.updatedBy = CURRENT_USER;
        return next;

    });

    closeFactBatchEditModal();
    searchFacts();
}

function batchDeleteFacts() {
    if (!factState.selected.size) return;
    const ids = new Set(factState.selected);
    const count = ids.size;
    factState.data = factState.data.filter((f) => !ids.has(f.id));
    appendOperationLog('facts', '批量删除', '-', '-', `共 ${count} 条`);
    clearFactSelection();
    renderStats();
    renderFactStats();
    searchFacts();
}


function exportFacts() {
    console.info('mock export facts:', factState.filtered.length);
    alert(`Mock导出：当前筛选结果 ${factState.filtered.length} 条`);
}

function toggleEntitySelectAll() {


    const checked = !!qs('#entity-select-all')?.checked;
    entityState.selected.clear();
    if (checked) entityState.filtered.forEach((e) => entityState.selected.add(e.id));
    renderEntitiesTable();
}

function toggleEntitySelect(id, el) {
    if (el.checked) entityState.selected.add(id);
    else entityState.selected.delete(id);
    updateEntitySelectionUI();
}

function clearEntitySelection() {
    entityState.selected.clear();
    const all = qs('#entity-select-all');
    if (all) all.checked = false;
    renderEntitiesTable();
}

function updateEntitySelectionUI() {
    const count = qs('#entity-selected-count');
    if (count) count.textContent = `已选择 ${entityState.selected.size} 项`;
    const bar = qs('#entity-batch-toolbar');
    if (bar) bar.style.display = entityState.selected.size ? 'flex' : 'none';
}

function getRootIds() {
    return entityState.data.filter((e) => e.parentId === null).map((e) => e.id);
}

function ensureTreeExpandedDefaults() {
    if (entityState.treeExpanded.size) return;
    entityState.data.forEach((e) => {
        if (getChildren(e.id).length) entityState.treeExpanded.add(e.id);
    });
}

function renderEntityTree() {
    const container = qs('#entity-tree-container');
    if (!container) return;
    ensureTreeExpandedDefaults();

    const roots = entityState.data.filter((e) => e.parentId === null);
    container.innerHTML = roots.map((root) => renderTreeNode(root, 0)).join('');
}

function renderTreeNode(entity, level) {
    const children = getChildren(entity.id).sort((a, b) => a.id - b.id);
    const hasChildren = children.length > 0;
    const expanded = entityState.treeExpanded.has(entity.id);
    const indent = level * 20;

    const row = `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 8px 6px ${8 + indent}px;border-bottom:1px solid #f0f0f0;">
            <div style="display:flex;align-items:center;gap:8px;min-width:0;">
                <span style="cursor:${hasChildren ? 'pointer' : 'default'};width:14px;display:inline-block;color:#666;" onclick="toggleTreeNode(${entity.id})">${hasChildren ? (expanded ? '▼' : '▶') : '•'}</span>
                <span style="font-size:12px;color:#999;">(${entity.id})</span>
                <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:420px;">${entity.name}</span>
            </div>
            <button class="btn btn-secondary" style="padding:4px 10px;font-size:12px;" onclick="editEntity(${entity.id})">编辑</button>
        </div>
    `;

    if (!hasChildren || !expanded) return row;
    return row + children.map((child) => renderTreeNode(child, level + 1)).join('');
}

function toggleTreeNode(id) {
    if (entityState.treeExpanded.has(id)) entityState.treeExpanded.delete(id);
    else entityState.treeExpanded.add(id);
    renderEntityTree();
}

function buildNetworkGraph() {
    const nodes = entityState.data.map((e) => {
        const level = getEntityLevel(e);
        return {
            id: e.id,
            label: e.name,
            title: `${e.name}\nID: ${e.id}\n别名: ${(e.aliases || []).join(', ') || '-'}\n时间: ${e.startTime || '-'} ~ ${e.endTime || '-'}`,
            group: Math.min(level, 4),
            shape: 'dot',
            size: Math.max(12, 22 - level * 2)
        };
    });

    const edges = entityState.data
        .filter((e) => e.parentId !== null)
        .map((e) => ({ id: `${e.parentId}-${e.id}`, from: e.parentId, to: e.id, arrows: 'to' }));

    return { nodes, edges };
}

function ensureNetworkExpandedDefaults() {
    if (entityState.networkExpanded.size) return;
    getRootIds().forEach((id) => entityState.networkExpanded.add(id));
}

function computeVisibleNetworkNodeIds() {
    const visible = new Set();
    const walk = (id) => {
        visible.add(id);
        if (!entityState.networkExpanded.has(id)) return;
        getChildren(id).forEach((child) => walk(child.id));
    };
    getRootIds().forEach((id) => walk(id));
    return visible;
}

function refreshEntityNetworkVisibility() {
    if (!entityState.networkNodes || !entityState.networkEdges) return;
    const visible = computeVisibleNetworkNodeIds();

    const nodeUpdates = entityState.data.map((e) => ({ id: e.id, hidden: !visible.has(e.id) }));
    const edgeUpdates = entityState.data
        .filter((e) => e.parentId !== null)
        .map((e) => ({ id: `${e.parentId}-${e.id}`, hidden: !(visible.has(e.id) && visible.has(e.parentId)) }));

    entityState.networkNodes.update(nodeUpdates);
    entityState.networkEdges.update(edgeUpdates);
}

function isUsableNetworkContainer(container) {
    if (!container || !container.isConnected) return false;
    if (typeof container.getBoundingClientRect !== 'function') return false;
    try {
        const rect = container.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
    } catch (err) {
        console.warn('network container check skipped:', err?.message || err);
        return false;
    }
}

function safelyFitEntityNetwork(animation = false) {
    const container = qs('#entity-network-container');
    if (!entityState.network || !isUsableNetworkContainer(container)) return;
    try {
        entityState.network.fit({ animation });
    } catch (err) {
        console.warn('network fit skipped:', err?.message || err);
    }
}

function safelyRedrawEntityNetwork() {
    if (!entityState.network) return;
    try {
        entityState.network.redraw();
    } catch (err) {
        console.warn('network redraw skipped:', err?.message || err);
    }
}

function destroyEntityNetwork() {
    if (!entityState.network) return;
    try {
        entityState.network.destroy();
    } catch (err) {
        console.warn('network destroy skipped:', err?.message || err);
    }
    entityState.network = null;
    entityState.networkNodes = null;
    entityState.networkEdges = null;
    entityState.networkSelectedId = null;
}

function renderEntityNetwork() {
    const container = qs('#entity-network-container');
    if (!container) return;
    ensureNetworkExpandedDefaults();

    if (typeof vis === 'undefined') {
        container.innerHTML = '<div class="loading">vis-network 未加载，无法显示网状图</div>';
        return;
    }

    if (!isUsableNetworkContainer(container)) return;

    if (!entityState.network) {
        const { nodes, edges } = buildNetworkGraph();
        entityState.networkNodes = new vis.DataSet(nodes);
        entityState.networkEdges = new vis.DataSet(edges);

        const options = {
            layout: { hierarchical: false },
            interaction: { hover: true, navigationButtons: true, multiselect: false },
            physics: {
                enabled: true,
                barnesHut: { gravitationalConstant: -6000, springLength: 120, springConstant: 0.03 }
            },
            edges: { color: '#b0b6c3', smooth: { type: 'dynamic' } },
            groups: {
                0: { color: { background: '#667eea', border: '#4c63d2' }, font: { color: '#fff' } },
                1: { color: { background: '#8fa3ff', border: '#6f85f7' } },
                2: { color: { background: '#b9c7ff', border: '#98acf7' } },
                3: { color: { background: '#d6defe', border: '#b9c7ff' } },
                4: { color: { background: '#edf1ff', border: '#d6defe' } }
            }
        };

        try {
            entityState.network = new vis.Network(container, { nodes: entityState.networkNodes, edges: entityState.networkEdges }, options);
        } catch (err) {
            console.warn('network init skipped:', err?.message || err);
            destroyEntityNetwork();
            return;
        }

        entityState.network.on('click', (params) => {
            const id = params.nodes?.[0];
            if (!id) return;
            entityState.networkSelectedId = id;
            const hasChildren = getChildren(id).length > 0;
            if (!hasChildren) return;
            if (entityState.networkExpanded.has(id)) entityState.networkExpanded.delete(id);
            else entityState.networkExpanded.add(id);
            refreshEntityNetworkVisibility();
        });

        entityState.network.on('doubleClick', (params) => {
            const id = params.nodes?.[0];
            if (id) editEntity(id);
        });
    } else {
        const graph = buildNetworkGraph();
        entityState.networkNodes.clear();
        entityState.networkEdges.clear();
        entityState.networkNodes.add(graph.nodes);
        entityState.networkEdges.add(graph.edges);
        safelyRedrawEntityNetwork();
    }

    refreshEntityNetworkVisibility();
    requestAnimationFrame(() => safelyFitEntityNetwork(false));
}


function collapseSelectedEntityNetworkNode() {
    const id = entityState.networkSelectedId;
    if (!id) return;
    entityState.networkExpanded.delete(id);
    refreshEntityNetworkVisibility();
}

function collapseAllEntityNetworkNodes() {
    entityState.networkExpanded.clear();
    getRootIds().forEach((id) => entityState.networkExpanded.add(id));
    refreshEntityNetworkVisibility();
}

function toggleEntityNetworkFullscreen() {
    const panel = qs('#entity-network-panel');
    const container = qs('#entity-network-container');
    const btn = qs('#entity-network-fullscreen-btn');
    if (!panel || !container) return;

    const entering = !panel.classList.contains('is-fullscreen');
    panel.classList.toggle('is-fullscreen', entering);

    if (entering) {
        Object.assign(panel.style, {
            position: 'fixed',
            inset: '10px',
            zIndex: '9999',
            margin: '0',
            borderRadius: '12px'
        });
        container.style.height = 'calc(100vh - 110px)';
    } else {
        Object.assign(panel.style, { position: '', inset: '', zIndex: '', margin: '', borderRadius: '' });
        container.style.height = '620px';
    }

    if (btn) btn.textContent = entering ? '退出全屏' : '全屏';
    setTimeout(() => safelyFitEntityNetwork(false), 80);
}


function editEntity(id) {
    showEntityModal(id);
}

function deleteEntity(id) {
    const idsToDelete = new Set([id]);
    const stack = [id];
    while (stack.length) {
        const cur = stack.pop();
        getChildren(cur).forEach((child) => {
            idsToDelete.add(child.id);
            stack.push(child.id);
        });
    }

    entityState.data = entityState.data.filter((e) => !idsToDelete.has(e.id));
    entityState.filtered = entityState.filtered.filter((e) => !idsToDelete.has(e.id));
    idsToDelete.forEach((x) => entityState.selected.delete(x));

    renderStats();
    renderEntityTagOptions();
    searchEntities();
}

function handleEntitySubmit(e) {
    e.preventDefault();
    const form = e.target;
    const editingId = Number(form.dataset.editingId || 0);
    const name = qs('#entity-name')?.value.trim();
    if (!name) return alert('实体名称不能为空');

    const parentIdRaw = qs('#entity-parent-id')?.value;
    const parentId = parentIdRaw ? Number(parentIdRaw) : null;

    const payload = {
        name,
        parentId,
        aliases: (qs('#entity-aliases')?.value || '').split(/\n+/).map((x) => x.trim()).filter(Boolean),
        description: qs('#entity-description')?.value || '',
        timeDescription: qs('#entity-time-description')?.value || '',
        startTime: qs('#entity-start-time')?.value || '',
        endTime: qs('#entity-end-time')?.value || '',
        reviewStatus: qs('#entity-review-status')?.value || 'pending',
        tags: Array.from(entityState.selectedFormTags),
        lang: qs('#entity-language-filter')?.value || 'zh',
        updatedAt: nowDateTime(),
        updatedBy: CURRENT_USER
    };

    if (editingId) {
        const idx = entityState.data.findIndex((x) => x.id === editingId);
        if (idx >= 0) {
            entityState.data[idx] = { ...entityState.data[idx], ...payload };
            appendOperationLog('entities', '编辑', editingId, payload.name, '更新实体信息');
        }
    } else {
        const newId = Math.max(0, ...entityState.data.map((x) => x.id)) + 1;
        entityState.data.unshift({ id: newId, ...payload });
        appendOperationLog('entities', '新建', newId, payload.name, '创建实体');
    }

    closeEntityModal();
    renderStats();
    renderEntityTagOptions();
    searchEntities();
}


function triggerEntitySearchOnEnter(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        searchEntities();
    }
}

function initializeTabs() {
    const activeTab = qs('.tabs .tab.active');
    const match = activeTab?.getAttribute('onclick')?.match(/'([\w-]+)'/);
    switchTab(match?.[1] || 'entities');
}

function autoStubHandlers() {
    const attrs = ['onclick', 'onchange', 'onkeyup', 'onkeydown', 'oninput', 'onblur', 'onfocus'];
    attrs.forEach((attr) => {
        qsa(`[${attr}]`).forEach((el) => {
            const raw = el.getAttribute(attr) || '';
            const m = raw.match(/^[\s]*([\w$]+)/);
            if (!m) return;
            const fnName = m[1];
            if (typeof window[fnName] !== 'function') {
                window[fnName] = (...args) => console.info(`[stub] ${fnName}`, ...args);
            }
        });
    });
}

function bindModalOverlayClose() {
    qsa('.modal').forEach((modal) => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modal.id);
        });
    });
}

function bindEntityEvents() {
    ['entity-language-filter', 'entity-tag-filter', 'entity-review-filter'].forEach((id) => {
        const el = qs(`#${id}`);
        if (el) el.addEventListener('change', searchEntities);
    });

    const searchInput = qs('#entity-search');
    if (searchInput) searchInput.addEventListener('keydown', triggerEntitySearchOnEnter);

    const form = qs('#entity-form');
    if (form) form.addEventListener('submit', handleEntitySubmit);
}

function bindEventEvents() {
    ['event-language-filter', 'event-review-filter', 'event-tag-filter', 'event-sort-filter'].forEach((id) => {
        const el = qs(`#${id}`);
        if (el) el.addEventListener('change', searchEvents);
    });

    const searchInput = qs('#event-search');
    if (searchInput) searchInput.addEventListener('keyup', searchEvents);
}

function bindFactEvents() {
    ['fact-id-search', 'fact-search'].forEach((id) => {
        const el = qs(`#${id}`);
        if (el) el.addEventListener('keyup', searchFacts);
    });

    ['fact-language-filter', 'fact-review-filter', 'fact-upload-filter', 'fact-contradiction-filter'].forEach((id) => {
        const el = qs(`#${id}`);
        if (el) el.addEventListener('change', searchFacts);
    });

    const form = qs('#fact-form');
    if (form) form.addEventListener('submit', handleFactSubmit);

    const eventForm = qs('#event-form');
    if (eventForm) eventForm.addEventListener('submit', handleEventSubmit);
}

window.onerror = (message, source, _lineno, _colno, error) => {
    const msg = `${message || ''} ${error?.message || ''}`;
    const src = `${source || ''}`;
    if (msg.includes('getBoundingClientRect') || (msg.includes('Script error') && src.includes('vis-network'))) {
        return true;
    }
    return false;
};

window.addEventListener('error', (event) => {
    const msg = `${event?.message || ''} ${event?.error?.message || ''}`;
    const source = `${event?.filename || ''}`;
    if (msg.includes('getBoundingClientRect') || (msg.includes('Script error') && source.includes('vis-network'))) {
        event.preventDefault();
    }
});


// ==========================================
// 事实提取与批量处理逻辑
// ==========================================

window.toggleFactEdit = function(btn) {
    const card = btn.closest('.fact-card-wrapper');
    const displayDiv = card.querySelector('.fact-content-display');
    const editDiv = card.querySelector('.fact-content-edit');
    const isEditing = editDiv.style.display !== 'none';

    if (isEditing) {
        // 保存逻辑
        const textarea = editDiv.querySelector('textarea');
        displayDiv.innerText = textarea.value;
        displayDiv.style.display = 'block';
        editDiv.style.display = 'none';
        btn.innerHTML = '✏️ 编辑';
        btn.classList.remove('btn-solid-blue');
        btn.classList.add('btn-outline-gray');
    } else {
        // 进入编辑逻辑
        const textarea = editDiv.querySelector('textarea');
        textarea.value = displayDiv.innerText;
        displayDiv.style.display = 'none';
        editDiv.style.display = 'block';
        btn.innerHTML = '💾 保存';
        btn.classList.remove('btn-outline-gray');
        btn.classList.add('btn-solid-blue');
    }
};

// 切换提取模式 (短文本快捷提取 / 长文本深度解析)
window.switchExtractionMode = function(mode) {
    const btnSingle = document.getElementById('btn-mode-single');
    const btnBatch = document.getElementById('btn-mode-batch');

    if (mode === 'single') {
        btnSingle.className = 'btn btn-solid-blue';
        btnBatch.className = 'btn btn-outline-gray';
        
        document.getElementById('single-extraction-view').style.display = 'block';
        document.getElementById('batch-extraction-view').style.display = 'none';
    } else {
        btnBatch.className = 'btn btn-solid-blue';
        btnSingle.className = 'btn btn-outline-gray';
        
        document.getElementById('single-extraction-view').style.display = 'none';
        document.getElementById('batch-extraction-view').style.display = 'block';
    }
};

// 短文本事实提取 (模拟)
window.extractFacts = function() {
    const text = document.getElementById('extraction-text').value;
    if (!text.trim()) {
        alert('请输入需要提取的文本');
        return;
    }
    
    const modeObj = document.querySelector('input[name="extract-mode"]:checked');
    const mode = modeObj ? modeObj.value : 'single';

    document.getElementById('fact-extraction-loading').style.display = 'block';
    document.getElementById('fact-extraction-results').style.display = 'none';
    
    setTimeout(() => {
        document.getElementById('fact-extraction-loading').style.display = 'none';
        document.getElementById('fact-extraction-results').style.display = 'block';
        
        // 模拟更接近原始设计稿的提取结果卡片
        const listContainer = document.getElementById('fact-extraction-facts-list');
        const singleCardHtml = `
            <div class="fact-card-wrapper" style="border: 1px solid #E5E6EB; border-radius: 8px; margin-bottom: 16px; background: white; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                <div style="padding: 16px; border-bottom: 1px solid #E5E6EB; display: flex; justify-content: space-between; align-items: flex-start; background: #FAFAFB;">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                            <span style="background: rgba(0, 164, 166, 0.1); color: var(--brand-cyan); padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">新提取</span>
                            <span style="font-size: 14px; font-weight: bold; color: var(--text-color);">事实候选区</span>
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px; margin-left: 16px;">
                        <button class="btn btn-solid-blue" style="padding: 6px 12px; font-size: 12px;" onclick="alert('入库成功！')">确认入库</button>
                        <button class="btn btn-outline-gray" style="padding: 6px 12px; font-size: 12px;" onclick="toggleFactEdit(this)">✏️ 编辑</button>
                        <button class="btn btn-outline-gray" style="padding: 6px 12px; font-size: 12px; color: #F53F3F; border-color: #F53F3F;">放弃</button>
                    </div>
                </div>
                
                <div style="padding: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <!-- 左侧：内容与冲突判断 -->
                    <div style="display: flex; flex-direction: column; gap: 16px;">
                        <div>
                            <div style="font-size: 12px; color: var(--text-regular); margin-bottom: 6px; font-weight: bold;">原本的内容 (原文片段)</div>
                            <div style="font-size: 13px; color: var(--text-color); background: #F2F3F5; padding: 10px; border-radius: 6px; line-height: 1.5;">${text.substring(0, 100)}${text.length > 100 ? '...' : ''}</div>
                        </div>
                        
                        <div>
                            <div style="font-size: 12px; color: var(--text-regular); margin-bottom: 6px; font-weight: bold;">AI 提取的事实</div>
                            <div class="fact-content-display" style="font-size: 14px; color: var(--text-color); line-height: 1.6;">全国大赛预赛于3月10日9点开始。</div>
                            <div class="fact-content-edit" style="display: none;">
                                <textarea style="width: 100%; padding: 8px; border: 1px solid #165DFF; border-radius: 6px; font-size: 14px; line-height: 1.6; resize: vertical; min-height: 60px; outline: none;"></textarea>
                            </div>
                        </div>

                        <!-- 冲突检测区域 -->
                        <div>
                            <div style="font-size: 12px; color: var(--text-regular); margin-bottom: 6px; font-weight: bold;">AI 事实校验 (冲突网络)</div>
                            <div style="padding: 12px; background: #FFF1F0; border-radius: 6px; border-left: 3px solid #F53F3F;">
                                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                                    <span style="color: #F53F3F; font-size: 13px; font-weight: bold;">⚠️ 发现事实细节冲突</span>
                                    <span style="color: var(--text-regular); font-size: 12px;">时间有出入 (9点 vs 10点)</span>
                                </div>
                                <div style="font-size: 12px; color: var(--text-color); background: rgba(255,255,255,0.8); padding: 8px; border-radius: 4px;">
                                    <span style="color: var(--text-regular);">现有事实 ID 50001：</span><br/>
                                    全国大赛预赛于3月10日10点开始。
                                </div>
                                <div style="margin-top: 8px; display: flex; gap: 8px;">
                                    <button class="btn btn-outline-gray" style="padding: 4px 8px; font-size: 12px; color: #F53F3F; border-color: #F53F3F;">强制覆盖</button>
                                    <button class="btn btn-outline-gray" style="padding: 4px 8px; font-size: 12px;">作为新事实入库</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 右侧：图谱关联资产区域 -->
                    <div>
                        <div style="font-size: 12px; color: var(--text-regular); margin-bottom: 8px; font-weight: bold;">知识图谱映射状态</div>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #F2F3F5; border-radius: 6px;">
                                <div>
                                    <span style="font-size: 13px; color: var(--text-color);">全国大赛</span>
                                    <span style="margin-left: 8px; background: #E8F3FF; color: #165DFF; padding: 2px 6px; border-radius: 4px; font-size: 10px;">已知实体 ID: 1011</span>
                                </div>
                                <span style="color: #00B42A; font-size: 14px;">✓</span>
                            </div>
                            <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #FFF7E8; border-radius: 6px; border: 1px dashed #FF7D00;">
                                <div>
                                    <span style="font-size: 13px; color: var(--text-color);">2026春季赛</span>
                                    <span style="margin-left: 8px; background: #FFF7E8; color: #FF7D00; padding: 2px 6px; border-radius: 4px; font-size: 10px;">待审核新事件 (TempID)</span>
                                </div>
                                <span style="color: #FF7D00; font-size: 12px; cursor: pointer;">去审核 ➡️</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        if (mode === 'multiple') {
            listContainer.innerHTML = [1, 2, 3].map(i => 
                singleCardHtml.replace('全国大赛预赛于3月10日9点开始。', `提取的分散事实 ${i}：这是从长句中拆分出来的第 ${i} 个核心知识点。`)
            ).join('');
        } else {
            listContainer.innerHTML = singleCardHtml;
        }
    }, 1500);
};

// ==========================================
// 长文本深度解析 (两阶段确认流)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // 绑定批量解析的文件上传模拟交互
    const fileUploadBatch = document.getElementById('file-upload-batch');
    if (fileUploadBatch) {
        fileUploadBatch.addEventListener('change', function(e) {
            if (this.files && this.files.length > 0) {
                const fileName = this.files[0].name;
                const textarea = document.getElementById('batch-extraction-text');
                textarea.value = `[提取自 ${fileName}]\n\n官方宣布，2026无畏契约春季赛将于5月正式开启。\n另外，新版本中，破败王者之刃的属性进行了调整，现在提供额外10%吸血。\n最终的冠军队伍将获得100万奖金奖励。`;
                // 自动选择复选框的特效可根据实际需求补充
                alert(`业务文档 "${fileName}" 读取成功，内容已填入解析框。系统将根据下方的规则执行清洗和重组。`);
            }
        });
    }
});

let currentBatchState = {
    tempEntities: [],
    tempEvents: [],
    candidateFacts: [],
    idMap: {} // TempID -> RealID 映射
};

window.startBatchExtraction = function() {
    const text = document.getElementById('batch-extraction-text').value;
    if (!text.trim()) {
        alert('请输入需要解析的长文本');
        return;
    }
    
    document.getElementById('batch-extraction-loading').style.display = 'block';
    
    // 模拟大模型处理延迟
    setTimeout(() => {
        document.getElementById('batch-extraction-loading').style.display = 'none';
        
        // 模拟从文本中抽取出的新实体和事件 (沙盒阶段)
        currentBatchState.tempEntities = [
            { tempId: 'temp_ent_1', name: '2026无畏契约春季赛', type: '赛事', desc: '基于文本中的大型比赛实体提取' },
            { tempId: 'temp_ent_2', name: '破败王者之刃', type: '装备', desc: '根据版本更新说明提取出的新增游戏道具' }
        ];
        
        currentBatchState.tempEvents = [
            { tempId: 'temp_evt_1', name: '春季总决赛', startTime: '2026/05/01', source: '文本时效性推断: \"5月正式开启\"' }
        ];
        
        // 模拟从文本中抽取出的事实 (包含对 TempID 的引用)
        currentBatchState.candidateFacts = [
            { id: 'fact_1', content: '2026无畏契约春季赛将于5月开启', sourceText: '官方宣布，2026无畏契约春季赛将于5月正式开启。', tempEntityId: 'temp_ent_1', tempEventId: 'temp_evt_1', status: 'green' },
            { id: 'fact_2', content: '破败王者之刃提供额外10%吸血', sourceText: '新版本中，破败王者之刃的属性进行了调整，现在提供额外10%吸血。', existingFactContent: '破败王者之刃提供额外12%吸血', tempEntityId: 'temp_ent_2', status: 'yellow', conflictMsg: '与旧事实数值冲突（10% vs 12%）' },
            { id: 'fact_3', content: '该赛事冠军队伍将获得100万奖金', sourceText: '最终的冠军队伍将获得100万奖金奖励。', existingEntityId: '10045', existingEntityName: '无畏契约', status: 'red', conflictMsg: '由于代词指代不明，缺失关键实体关联，未能识别“该赛事”的具体指代对象' }
        ];
        
        // 渲染步骤2视图
        renderBatchSkeletons();
        showBatchStep(2);
    }, 2000);
};

window.renderBatchSkeletons = function() {
    document.getElementById('new-entities-count').innerText = currentBatchState.tempEntities.length;
    document.getElementById('new-events-count').innerText = currentBatchState.tempEvents.length;
    
    const entList = document.getElementById('batch-new-entities-list');
    entList.innerHTML = currentBatchState.tempEntities.map(ent => `
        <div style="display: flex; align-items: center; margin-bottom: 10px; padding: 10px; background: #fafafa; border-radius: 4px; border: 1px solid #eee;">
            <input type="checkbox" checked data-tempid="${ent.tempId}" class="temp-ent-checkbox" style="margin-right: 10px;">
            <div style="flex: 1;">
                <div style="font-weight: bold;">${ent.name}</div>
                <div style="font-size: 12px; color: #666;">分类: ${ent.type} | ${ent.desc}</div>
            </div>
        </div>
    `).join('');
    
    const evtList = document.getElementById('batch-new-events-list');
    evtList.innerHTML = currentBatchState.tempEvents.map(evt => `
        <div style="display: flex; align-items: center; margin-bottom: 10px; padding: 10px; background: #fafafa; border-radius: 4px; border: 1px solid #eee;">
            <input type="checkbox" checked data-tempid="${evt.tempId}" class="temp-evt-checkbox" style="margin-right: 10px;">
            <div style="flex: 1;">
                <div style="font-weight: bold;">${evt.name}</div>
                <div style="font-size: 12px; color: #666;">时间: ${evt.startTime}</div>
            </div>
        </div>
    `).join('');
};

window.confirmBatchSkeletons = function() {
    // 模拟将勾选的新实体/事件写入主库，获取真实ID
    const checkedEnts = Array.from(document.querySelectorAll('.temp-ent-checkbox:checked')).map(cb => cb.dataset.tempid);
    const checkedEvts = Array.from(document.querySelectorAll('.temp-evt-checkbox:checked')).map(cb => cb.dataset.tempid);
    
    currentBatchState.idMap = {};
    
    // 生成伪造的 RealID
    checkedEnts.forEach(tId => { currentBatchState.idMap[tId] = 90000 + Math.floor(Math.random() * 1000); });
    checkedEvts.forEach(tId => { currentBatchState.idMap[tId] = 80000 + Math.floor(Math.random() * 1000); });
    
    // 清洗事实数据，替换 TempID 为 RealID，并构建展示用的 relations 数组
    currentBatchState.candidateFacts.forEach(fact => {
        fact.relations = [];
        
        // 1. 已存在的库内实体（模拟已知关联）
        if (fact.existingEntityId) {
            fact.relations.push({ type: 'entity', name: fact.existingEntityName || '已知实体', id: fact.existingEntityId, isNew: false });
        }

        // 2. 新提取的实体
        if (fact.tempEntityId) {
            const ent = currentBatchState.tempEntities.find(e => e.tempId === fact.tempEntityId);
            if (currentBatchState.idMap[fact.tempEntityId]) {
                fact.realEntityId = currentBatchState.idMap[fact.tempEntityId];
                fact.relations.push({ type: 'entity', name: ent ? ent.name : '新实体', id: fact.realEntityId, isNew: true });
            } else {
                fact.relations.push({ type: 'entity', name: ent ? ent.name : '新实体', isNew: true, skipped: true });
            }
        }
        
        // 3. 新提取的事件
        if (fact.tempEventId) {
            const evt = currentBatchState.tempEvents.find(e => e.tempId === fact.tempEventId);
            if (currentBatchState.idMap[fact.tempEventId]) {
                fact.realEventId = currentBatchState.idMap[fact.tempEventId];
                fact.relations.push({ type: 'event', name: evt ? evt.name : '新事件', id: fact.realEventId, isNew: true });
            } else {
                fact.relations.push({ type: 'event', name: evt ? evt.name : '新事件', isNew: true, skipped: true });
            }
        }
    });
    
    classifyAndRenderBatchFacts();
    showBatchStep(3);
};

window.classifyAndRenderBatchFacts = function() {
    const green = [], yellow = [], red = [];
    
    currentBatchState.candidateFacts.forEach(fact => {
        // 如果关联为空 (既没有新的被确认，也没有已知的)，且状态不是黄灯，就标红（缺失关联）
        const hasValidRelation = fact.relations.some(r => !r.skipped);
        if (fact.status === 'red' || (!hasValidRelation && fact.status !== 'yellow')) {
            red.push(fact);
        } else if (fact.status === 'yellow') {
            yellow.push(fact);
        } else {
            green.push(fact);
        }
    });
    
    document.getElementById('green-count').innerText = green.length;
    document.getElementById('yellow-count').innerText = yellow.length;
    document.getElementById('red-count').innerText = red.length;
    
    document.getElementById('batch-facts-green').innerHTML = green.map(f => createFactCardHtml(f, '🟢 可直接导入')).join('') + 
        (green.length > 0 ? `<button class="btn btn-solid-blue" style="margin-top: 15px; width: 100%;" onclick="alert('成功导入 ${green.length} 条事实！')">一键导入所有无冲突事实</button>` : '<div style="padding: 20px; text-align: center; color: #999;">暂无数据</div>');
        
    document.getElementById('batch-facts-yellow').innerHTML = yellow.map(f => createFactCardHtml(f, '⚠️ 冲突警告', f.conflictMsg)).join('') || '<div style="padding: 20px; text-align: center; color: #999;">暂无数据</div>';
    
    document.getElementById('batch-facts-red').innerHTML = red.map(f => createFactCardHtml(f, '🔴 关联缺失', f.conflictMsg)).join('') || '<div style="padding: 20px; text-align: center; color: #999;">暂无数据</div>';
    
    switchBatchFactTab('green');
};

window.handleFactAction = function(btn, actionType) {
    const card = btn.closest('.fact-card-wrapper');
    if (!card) return;

    if (actionType === 'accept') {
        btn.innerHTML = '✅ 已成功关联入库';
        btn.className = 'btn btn-solid-blue';
        btn.disabled = true;
        btn.style.opacity = '0.8';
        btn.style.cursor = 'not-allowed';
    } else if (actionType === 'reject') {
        card.style.opacity = '0.4';
        card.style.pointerEvents = 'none';
        btn.innerHTML = '已放弃处理';
        btn.disabled = true;
    } else if (actionType === 'override') {
        alert('已成功覆盖原有库内事实！算法将采纳新文本表述。');
        const conflictDiv = card.querySelector('.conflict-alert');
        if (conflictDiv) conflictDiv.style.display = 'none';
        btn.innerHTML = '✅ 已覆盖入库';
        btn.className = 'btn btn-solid-blue';
        btn.disabled = true;
    } else if (actionType === 'new') {
        alert('已作为独立的新事实入库，将与旧事实并存！');
        btn.innerHTML = '✅ 已独立入库';
        btn.className = 'btn btn-solid-blue';
        btn.disabled = true;
    }
};

function createFactCardHtml(fact, badgeText, warningMsg = '') {
    const isGreen = fact.status === 'green' || !warningMsg;
    const isYellow = fact.status === 'yellow';
    
    // 决定边框和背景的颜色基调
    const borderColor = isGreen ? '#E5E6EB' : (isYellow ? '#F7BA1E' : '#F53F3F');
    const badgeBg = isGreen ? '#E8F5E9' : (isYellow ? '#FFF8E1' : '#FFEBEE');
    const badgeColor = isGreen ? '#2E7D32' : (isYellow ? '#F57F17' : '#C62828');

    return `
        <div class="fact-card-wrapper" style="border: 1px solid ${borderColor}; border-radius: 8px; margin-bottom: 16px; background: white; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <div style="padding: 12px 16px; border-bottom: 1px solid #E5E6EB; display: flex; justify-content: space-between; align-items: center; background: #FAFAFB;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="background: ${badgeBg}; color: ${badgeColor}; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">${badgeText}</span>
                    <span style="font-size: 12px; color: var(--text-regular);">关联实体数: <span style="font-weight:bold; color:var(--text-color);">${fact.relations ? fact.relations.filter(r => r.type === 'entity').length : 0}</span> | 关联事件数: <span style="font-weight:bold; color:var(--text-color);">${fact.relations ? fact.relations.filter(r => r.type === 'event').length : 0}</span></span>
                </div>
                <div style="display: flex; gap: 8px;">
                    ${isGreen ? `<button class="btn btn-solid-blue" style="padding: 4px 10px; font-size: 12px;" onclick="handleFactAction(this, 'accept')">✅ 确认入库</button>` : `<button class="btn btn-outline-gray" style="padding: 4px 10px; font-size: 12px; color: ${badgeColor}; border-color: ${badgeColor};" onclick="handleFactAction(this, 'accept')">强制入库</button>`}
                    <button class="btn btn-outline-gray" style="padding: 4px 10px; font-size: 12px;" onclick="toggleFactEdit(this)">✏️ 编辑</button>
                    <button class="btn btn-outline-gray" style="padding: 4px 10px; font-size: 12px; color: #F53F3F; border-color: #F53F3F;" onclick="handleFactAction(this, 'reject')">🗑️ 放弃</button>
                </div>
            </div>
            
            <div style="padding: 16px;">
                <div style="display: grid; grid-template-columns: 3fr 2fr; gap: 20px;">
                    <!-- 左侧：文本与事实内容 -->
                    <div>
                        ${fact.sourceText ? `
                        <div style="margin-bottom: 12px;">
                            <div style="font-size: 12px; color: var(--text-regular); margin-bottom: 4px; font-weight: bold;">原本的内容 (来源文本片段)</div>
                            <div style="font-size: 13px; color: var(--text-color); background: #F2F3F5; padding: 8px 12px; border-radius: 6px; line-height: 1.5;">${fact.sourceText}</div>
                        </div>
                        ` : ''}
                        
                        <div style="margin-bottom: ${warningMsg ? '12px' : '0'};">
                            <div style="font-size: 12px; color: var(--text-regular); margin-bottom: 4px; font-weight: bold;">AI 提取的事实</div>
                            <div class="fact-content-display" style="font-size: 14px; color: var(--text-color); line-height: 1.6;">${fact.content}</div>
                            <div class="fact-content-edit" style="display: none;">
                                <textarea style="width: 100%; padding: 8px; border: 1px solid #165DFF; border-radius: 6px; font-size: 14px; line-height: 1.6; resize: vertical; min-height: 60px; outline: none;"></textarea>
                            </div>
                        </div>
                        
                        ${warningMsg ? `
                        <div class="conflict-alert" style="padding: 10px; background: ${badgeBg}; border-radius: 6px; border-left: 3px solid ${badgeColor}; display: flex; flex-direction: column; gap: 6px;">
                            <div style="display: flex; align-items: flex-start; gap: 8px;">
                                <span style="color: ${badgeColor}; font-size: 13px; font-weight: bold;">🚨 冲突判断：</span>
                                <div style="font-size: 12px; color: var(--text-color); line-height: 1.5;">${warningMsg}</div>
                            </div>
                            ${fact.existingFactContent ? `
                            <div style="font-size: 12px; color: var(--text-color); background: rgba(255,255,255,0.8); padding: 8px; border-radius: 4px; margin-left: 24px; border: 1px solid rgba(0,0,0,0.05);">
                                <span style="color: var(--text-regular);">现有库内事实：</span><br/>
                                ${fact.existingFactContent}
                            </div>
                            ` : ''}
                            ${isYellow ? `
                            <div style="margin-top: 6px; margin-left: 24px; display: flex; gap: 8px;">
                                <button class="btn btn-outline-gray" style="padding: 4px 8px; font-size: 12px; color: #F53F3F; border-color: #F53F3F;" onclick="handleFactAction(this, 'override')">强制覆盖</button>
                                <button class="btn btn-outline-gray" style="padding: 4px 8px; font-size: 12px;" onclick="handleFactAction(this, 'new')">作为新事实入库</button>
                            </div>
                            ` : ''}
                        </div>
                        ` : ''}
                    </div>

                    <!-- 右侧：图谱关联资产区域 -->
                    <div>
                        <div style="font-size: 12px; color: var(--text-regular); margin-bottom: 8px; font-weight: bold;">知识图谱映射状态</div>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            ${fact.relations && fact.relations.length > 0 ? fact.relations.map(rel => {
                                if (rel.skipped) {
                                    return `
                                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #FFF1F0; border-radius: 6px; border: 1px dashed #F53F3F;">
                                        <div>
                                            <span style="font-size: 13px; color: var(--text-color); text-decoration: line-through;">${rel.name}</span>
                                            <span style="margin-left: 8px; background: #FFF1F0; color: #F53F3F; padding: 2px 6px; border-radius: 4px; font-size: 10px;">已在步骤二剔除</span>
                                        </div>
                                        <span style="color: #F53F3F; font-size: 14px;">✗</span>
                                    </div>`;
                                } else if (rel.isNew) {
                                    return `
                                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #E8F3FF; border-radius: 6px; border: 1px solid #165DFF;">
                                        <div>
                                            <span style="font-size: 13px; color: var(--text-color); font-weight: bold;">${rel.name}</span>
                                            <span style="margin-left: 8px; background: #165DFF; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px;">✨ 将自动创建新${rel.type === 'entity' ? '实体' : '事件'} (${rel.id})</span>
                                        </div>
                                        <span style="color: #165DFF; font-size: 14px;">✓</span>
                                    </div>`;
                                } else {
                                    return `
                                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #F2F3F5; border-radius: 6px;">
                                        <div>
                                            <span style="font-size: 13px; color: var(--text-color);">${rel.name}</span>
                                            <span style="margin-left: 8px; background: #E5E6EB; color: #4E5969; padding: 2px 6px; border-radius: 4px; font-size: 10px;">关联已知${rel.type === 'entity' ? '实体' : '事件'} (${rel.id})</span>
                                        </div>
                                        <span style="color: #00B42A; font-size: 14px;">✓</span>
                                    </div>`;
                                }
                            }).join('') : `
                                <div style="padding: 10px; text-align: center; color: #999; font-size: 12px; background: #FAFAFB; border-radius: 6px; border: 1px dashed #E5E6EB;">
                                    未检测到任何实体或事件关联
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

window.showBatchStep = function(step) {
    document.getElementById('batch-step-1').style.display = step === 1 ? 'block' : 'none';
    document.getElementById('batch-step-2').style.display = step === 2 ? 'block' : 'none';
    document.getElementById('batch-step-3').style.display = step === 3 ? 'block' : 'none';
    
    document.getElementById('step-1-indicator').style.color = step === 1 ? '#4a90e2' : '#999';
    document.getElementById('step-2-indicator').style.color = step === 2 ? '#4a90e2' : '#999';
    document.getElementById('step-3-indicator').style.color = step === 3 ? '#4a90e2' : '#999';
    
    if(step === 2) {
        document.getElementById('step-2-indicator').style.fontWeight = 'bold';
        document.getElementById('step-1-indicator').style.fontWeight = 'normal';
    } else if(step === 3) {
        document.getElementById('step-3-indicator').style.fontWeight = 'bold';
        document.getElementById('step-2-indicator').style.fontWeight = 'normal';
    } else {
        document.getElementById('step-1-indicator').style.fontWeight = 'bold';
    }
};

window.switchBatchFactTab = function(tabName) {
    document.getElementById('batch-facts-green').style.display = tabName === 'green' ? 'block' : 'none';
    document.getElementById('batch-facts-yellow').style.display = tabName === 'yellow' ? 'block' : 'none';
    document.getElementById('batch-facts-red').style.display = tabName === 'red' ? 'block' : 'none';
    
    document.getElementById('tab-green').style.borderBottom = tabName === 'green' ? '3px solid #2e7d32' : 'none';
    document.getElementById('tab-yellow').style.borderBottom = tabName === 'yellow' ? '3px solid #f57f17' : 'none';
    document.getElementById('tab-red').style.borderBottom = tabName === 'red' ? '3px solid #c62828' : 'none';
    
    document.getElementById('tab-green').style.opacity = tabName === 'green' ? '1' : '0.6';
    document.getElementById('tab-yellow').style.opacity = tabName === 'yellow' ? '1' : '0.6';
    document.getElementById('tab-red').style.opacity = tabName === 'red' ? '1' : '0.6';
};

window.addEventListener('DOMContentLoaded', () => {
    initializeAuditFields();
    appendOperationLog('entities', '初始化', '-', '-', `加载 ${entityState.data.length} 条实体`);
    appendOperationLog('events', '初始化', '-', '-', `加载 ${eventState.data.length} 条事件`);
    appendOperationLog('facts', '初始化', '-', '-', `加载 ${factState.data.length} 条事实`);

    initializeTabs();
    autoStubHandlers();
    bindModalOverlayClose();
    bindEntityEvents();
    bindEventEvents();
    bindFactEvents();

    switchEntityView('list');
    switchEventView('list');

    renderStats();
    renderEntityTagOptions();
    renderEventTagOptions();
    loadFactCategories();
    renderFactStats();
    searchEntities();
    searchEvents();
    searchFacts();
    renderEntityTree();
});

// 错误表述检测模块
const errorDetectionState = {
    step: 0,
    errorText: '',
    correctText: '',
    originalContent: '',
    recallMode: {
        fuzzy: false,
        keyword: false,
        rag: false
    },
    models: {
        extract: '',
        filter: '',
        correct: ''
    },
    retrievedFacts: [],
    checkedFacts: [],
    correctedFacts: [],
    selectedFactIds: new Set()
};

// 检索与替换模块
window.startErrorDetection = async function() {
    const errorText = qs('#error-text')?.value?.trim();
    const correctText = qs('#correct-text')?.value?.trim();

    if (!errorText) {
        alert('请输入要查找的词/错误表述！');
        return;
    }

    errorDetectionState.errorText = errorText;
    errorDetectionState.correctText = correctText;
    errorDetectionState.selectedFactIds.clear();

    showLoading('error-detection-loading');
    
    // 模拟一步执行延迟
    await simulateDelay(1500);

    // 使用用户的输入进行检索并生成替换预览
    errorDetectionState.retrievedFacts = mockRetrieveFactsWithPresets(errorText, correctText);
    
    renderErrorDetectionStats();
    renderErrorDetectionFacts(errorDetectionState.retrievedFacts);
    
    hideLoading('error-detection-loading');
    qs('#error-detection-results').style.display = 'block';
};

function mockRetrieveFactsWithPresets(errorText, correctText) {
    const allFacts = factState.data;
    const results = [];
    
    allFacts.forEach(fact => {
        let replacedText = fact.factText;
        let matchedKeywords = [];
        let hasMatch = false;

        // 如果事实内容包含查找的词
        if (errorText && fact.factText && fact.factText.includes(errorText)) {
            replacedText = fact.factText.replaceAll(errorText, correctText || '');
            matchedKeywords = [errorText];
            hasMatch = true;
        }

        if (hasMatch) {
            results.push({
                ...fact,
                replacedText: replacedText,
                matchedKeywords: matchedKeywords,
                confidence: 0.85 + Math.random() * 0.1,
                hasMatch: true
            });
        }
    });
    
    // 按ID排序
    results.sort((a, b) => a.id - b.id);
    
    return results;
}

function renderErrorDetectionStats() {
    const statsContainer = qs('#error-detection-stats');
    if (!statsContainer) return;
    
    const facts = errorDetectionState.retrievedFacts || [];
    const matched = facts.filter(f => f.hasMatch).length;
    const selected = errorDetectionState.selectedFactIds.size;
    
    statsContainer.innerHTML = `
        <div style="padding: 15px; background: #fff3e0; border-radius: 6px;">
            <div style="font-size: 24px; font-weight: bold; color: #ef6c00;">${matched}</div>
            <div style="color: #666; font-size: 13px;">匹配到的事实总数</div>
        </div>
        <div style="padding: 15px; background: #e3f2fd; border-radius: 6px;">
            <div style="font-size: 24px; font-weight: bold; color: #1565c0;">${selected}</div>
            <div style="color: #666; font-size: 13px;">当前已选中的事实</div>
        </div>
    `;
}

function renderErrorDetectionFacts(facts) {
    const container = qs('#error-detection-facts');
    if (!container) return;
    
    if (!facts.length) {
        container.innerHTML = '<div style="color: #999; padding: 20px; text-align: center;">未匹配到任何相关事实</div>';
        
        // 隐藏批量操作按钮
        const batchBtn = qs('#btn-batch-correct');
        if (batchBtn) batchBtn.style.display = 'none';
        const selectAllCheckbox = qs('#error-detection-select-all');
        if (selectAllCheckbox) selectAllCheckbox.checked = false;
        
        return;
    }
    
    const errorText = errorDetectionState.errorText || '';
    const correctText = errorDetectionState.correctText || '';
    
    container.innerHTML = facts.map(fact => {
        const isSelected = errorDetectionState.selectedFactIds.has(fact.id);
        const highlightedOriginal = highlightKeywords(fact.factText || '', fact.matchedKeywords, false);
        const highlightedReplaced = fact.hasMatch ? highlightKeywords(fact.replacedText || '', [correctText], true) : fact.factText;
        
        return `
        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 15px; border-left: 4px solid #3CA0FF;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                    <input type="checkbox" 
                        ${isSelected ? 'checked' : ''} 
                        onchange="toggleFactSelect(${fact.id})"
                        style="width: 18px; height: 18px; cursor: pointer;">
                    <div style="flex: 1;">
                        <div style="font-weight: bold; font-size: 16px; color: #333; margin-bottom: 8px;">
                            ${fact.title || '无标题'}
                            <span style="font-size: 13px; padding: 4px 8px; border-radius: 4px; background: #e3f2fd; color: #1565c0; margin-left: 10px;">
                                匹配到关键词：${fact.matchedKeywords.join('、')}
                            </span>
                        </div>
                        <div style="color: #666; font-size: 13px;">ID: ${fact.id}</div>
                    </div>
                </div>
            </div>
            
            <div style="display: flex; gap: 15px; margin-bottom: 12px;">
                <div style="flex: 1; background: #f5f5f5; padding: 15px; border-radius: 6px;">
                    <div style="font-size: 13px; color: #999; margin-bottom: 5px;">检索内容（替换前）</div>
                    <div style="color: #333; line-height: 1.6; font-size: 14px;">${highlightedOriginal}</div>
                </div>
                
                <div style="flex: 1; background: #e8f5e9; padding: 15px; border-radius: 6px;">
                    <div style="font-size: 13px; color: #2e7d32; margin-bottom: 5px;">替换后</div>
                    <div style="color: #333; line-height: 1.6; font-size: 14px;">${highlightedReplaced}</div>
                </div>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; padding-top: 12px; border-top: 1px solid #e0e0e0;">
                <div style="font-size: 12px; color: #999;">
                    <span>关联实体：${getEntityNames(fact.entityIds) || '-'}</span> |
                    <span>关联事件：${getEventNames(fact.eventIds) || '-'}</span>
                </div>
                <button class="btn btn-solid-blue" style="padding: 6px 16px; font-size: 13px;" onclick="applySingleCorrection(${fact.id})">确认替换此条</button>
            </div>
        </div>
        `;
    }).join('');
    
    updateErrorDetectionSelectionUI();
}

window.toggleFactSelect = function(factId) {
    if (errorDetectionState.selectedFactIds.has(factId)) {
        errorDetectionState.selectedFactIds.delete(factId);
    } else {
        errorDetectionState.selectedFactIds.add(factId);
    }
    renderErrorDetectionStats();
    updateErrorDetectionSelectionUI();
};

window.toggleErrorDetectionSelectAll = function() {
    const selectAllCheckbox = qs('#error-detection-select-all');
    const isChecked = selectAllCheckbox.checked;
    
    if (isChecked) {
        errorDetectionState.retrievedFacts.forEach(fact => {
            errorDetectionState.selectedFactIds.add(fact.id);
        });
    } else {
        errorDetectionState.selectedFactIds.clear();
    }
    
    renderErrorDetectionStats();
    renderErrorDetectionFacts(errorDetectionState.retrievedFacts);
};

window.updateErrorDetectionSelectionUI = function() {
    const selectAllCheckbox = qs('#error-detection-select-all');
    const batchBtn = qs('#btn-batch-correct');
    
    const totalCount = errorDetectionState.retrievedFacts.length;
    const selectedCount = errorDetectionState.selectedFactIds.size;
    
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = totalCount > 0 && selectedCount === totalCount;
    }
    
    if (batchBtn) {
        batchBtn.style.display = selectedCount > 0 ? 'inline-block' : 'none';
        batchBtn.textContent = `批量确认替换 (${selectedCount}条)`;
    }
};

window.batchApplyCorrections = function() {
    if (errorDetectionState.selectedFactIds.size === 0) return;
    
    const count = errorDetectionState.selectedFactIds.size;
    const confirmed = confirm(`确认批量替换选中的 ${count} 条事实吗？`);
    if (!confirmed) return;
    
    let successCount = 0;
    errorDetectionState.selectedFactIds.forEach(factId => {
        const fact = errorDetectionState.retrievedFacts.find(f => f.id === factId);
        const targetFact = factState.data.find(f => f.id === factId);
        
        if (fact && targetFact && fact.replacedText) {
            targetFact.factText = fact.replacedText;
            targetFact.updatedAt = nowDateTime();
            targetFact.updatedBy = CURRENT_USER;
            appendOperationLog('facts', '批量替换', factId, fact.title, '批量应用检索替换');
            successCount++;
        }
    });
    
    // 移除已处理项并清空选择
    errorDetectionState.retrievedFacts = errorDetectionState.retrievedFacts.filter(f => !errorDetectionState.selectedFactIds.has(f.id));
    errorDetectionState.selectedFactIds.clear();
    
    alert(`成功替换 ${successCount} 条事实！`);
    renderFactStats();
    searchFacts();
    
    renderErrorDetectionStats();
    renderErrorDetectionFacts(errorDetectionState.retrievedFacts);
};

window.applySingleCorrection = function(factId) {
    const fact = errorDetectionState.retrievedFacts.find(f => f.id === factId);
    if (!fact || !fact.replacedText) return;
    
    const confirmed = confirm(`确定将事实 "${fact.title}" 的内容替换为新内容吗？`);
    if (!confirmed) return;
    
    const targetFact = factState.data.find(f => f.id === factId);
    if (targetFact) {
        targetFact.factText = fact.replacedText;
        targetFact.updatedAt = nowDateTime();
        targetFact.updatedBy = CURRENT_USER;
        
        appendOperationLog('facts', '确认替换', factId, fact.title, '应用检索替换');
        
        errorDetectionState.retrievedFacts = errorDetectionState.retrievedFacts.filter(f => f.id !== factId);
        errorDetectionState.selectedFactIds.delete(factId);
        
        alert('替换已应用！');
        renderFactStats();
        searchFacts();
        
        renderErrorDetectionStats();
        renderErrorDetectionFacts(errorDetectionState.retrievedFacts);
    }
};

function highlightKeywords(text, keywords, isReplacement = false) {
    if (!text || !keywords || !keywords.length) return text;
    let highlightedText = text;
    
    keywords.forEach(keyword => {
        if (!keyword) return;
        const regex = new RegExp(`(${escapeRegex(keyword)})`, 'gi');
        if (isReplacement) {
            // 替换后的新内容高亮（绿色）
            highlightedText = highlightedText.replace(regex, '<span style="background: #c8e6c9; padding: 2px 4px; border-radius: 3px; font-weight: 500; color: #1b5e20;">$1</span>');
        } else {
            // 原内容匹配的关键词高亮（黄色）
            highlightedText = highlightedText.replace(regex, '<span style="background: #fff3cd; padding: 2px 4px; border-radius: 3px; font-weight: 500; color: #f57f17;">$1</span>');
        }
    });
    
    return highlightedText;
}

function showLoading(loadingId) {
    const loading = qs(`#${loadingId}`);
    if (loading) loading.style.display = 'block';
}

function hideLoading(loadingId) {
    const loading = qs(`#${loadingId}`);
    if (loading) loading.style.display = 'none';
}

function simulateDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}







