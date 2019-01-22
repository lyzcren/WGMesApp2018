window.ViewConfig = [{
	id: 'ManageMenuItemList',
	url: '/view/System/ManageMenuItem.html',
	template: 'Default',
	title: "菜单项管理",
	showMenu: false
}, {
	id: 'Manuf_List',
	url: '/view/Prod/Manuf/List.html',
	template: 'Default',
	title: "生产记录",
	showMenu: false,
	showScan: false,
	showFilter: true,
	showAdd: false
}, {
	id: 'Manuf_View',
	url: '/view/Prod/Manuf/View.html',
	pullrefresh: true,
	title: "生产记录",
	showMenu: true,
	showScan: false,
	showFilter: false,
	showAdd: false
}, {
	id: 'Manuf_View_Technic',
	url: '/view/Prod/Manuf/View_Technic.html',
	template: 'Default',
	title: "工艺参数",
	showMenu: true,
	showScan: false,
	showFilter: false,
	showAdd: false
}, {
	id: 'Manuf_View_Defect',
	url: '/view/Prod/Manuf/View_Defect.html',
	template: 'Default',
	title: "不良",
	showMenu: true,
	showScan: false,
	showFilter: false,
	showAdd: false
}, {
	id: 'Manuf_View_Emp',
	url: '/view/Prod/Manuf/View_Emp.html',
	template: 'Default',
	title: "多操作员",
	showMenu: true,
	showScan: false,
	showFilter: false,
	showAdd: false
}, {
	id: 'Manuf_Distribute',
	url: '/view/Prod/Manuf/Distribute.html',
	title: "分配任务"
}, {
	id: 'Manuf_QuickTransfer',
	url: '/view/Prod/Manuf/QuickTransfer.html',
	title: "快速转序"
}, {
	id: 'Flow_List',
	url: '/view/Prod/Flow/List.html',
	listview: true,
	title: "流程单",
	showMenu: true,
	showScan: false,
	showFilter: true,
	showAdd: false
}, {
	id: 'Flow_View',
	url: '/view/Prod/Flow/View.html',
	title: "流程单详情"
}, {
	id: 'Flow_Routing',
	url: '/view/Prod/Flow/View_Routing.html',
	title: "工艺路线"
}, {
	id: 'ScanView',
	url: '/view/CommonViews/Barcode_scan.html',
	title: "扫描"
}, {
	id: 'Erp_ConfirmErpOut',
	url: '/view/ERP/ConfirmErpOut.html',
	title: "出库单校验"
}, {
	id: 'Erp_ChooseErpOut',
	url: '/view/ERP/ChooseErpOutList.html',
	title: "选择出库单"
},
];