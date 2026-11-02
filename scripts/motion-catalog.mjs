export const motionGroups={
 'Navegación':['.brand','.workspace-switch','.nav-item','.plan-mini','.founder','.top-create','.notification','.copilot-toggle'],
 'Dashboard':['.quick-modules button','.home-tabs button','.journey-steps button','.next-step button','.template-strip button','.card-heading button','.task-list .task-title','.goal-progress button'],
 'Formularios':['.profile-form input','.profile-form select','.profile-form textarea','.modal form input','.modal form textarea','.modal form select','.modal-actions .primary','.import-label'],
 'Documentos':['.studio-page-tree nav button','.studio-page-search input','.studio-document-title','.studio-document-tools button','.studio-document-meta button','.studio-block-controls button','.studio-block-type select','.studio-add-block'],
 'Tablero y tareas':['.database-kind-tabs button','.database-view-switch button','.database-controls input','.database-controls select','.database-bulk button','.database-record-title','.kanban-card button','.task-row .check'],
 'Copiloto':['.composer textarea','.composer .send','.context-tools .icon-btn','.research-toggle','.context-file button','.copilot-mode button','.message-actions button','.sent-files button'],
 'Informes y métricas':['.report-library button','.report-navigation button','.report-toolbar button','.intelligence-brief-tabs button','.simulator-field-grid input','.simulator-subheading select','.report-task-cards button','.report-source-list a'],
 'Menús y modales':['.attachment-menu button','.search-results button','.notifications-pop button','.create-grid button','.document-picker button','.modal-close','.studio-slash-menu button','.runtime-options button'],
 'Operadores y herramientas':['.operator-card','.workbench-input textarea','.workbench-input .primary','.mvp-steps button','.mvp-controls button','.studio-tabs button','.campaign-fields input','.canvas-fields textarea'],
 'Ayuda y recuperación':['.help-grid summary','.settings-card .btn','.setting-row .switch','.workspace-footer button','.conflict-banner button','.generation-error button','.studio-versions button','.action-receipt button']
};
export const motionEvents=['hover','focus','press','return'];
export const motionCatalog=Object.entries(motionGroups).flatMap(([group,selectors])=>selectors.flatMap((selector,i)=>motionEvents.map(event=>({id:group+'-'+i+'-'+event,group,selector,event}))));
