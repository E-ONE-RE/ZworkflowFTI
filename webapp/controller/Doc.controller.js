/*global location*/
sap.ui.define([
	"workflow/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"workflow/model/formatter"
], function(BaseController, JSONModel, History, formatter, MessageToast, Button) {
	"use strict";

	return BaseController.extend("workflow.controller.Doc", {
		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function() {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var iOriginalBusyDelay,
			    iOriginalBusyDelay2,
				oViewModel = new JSONModel({
					busy: true,
					delay: 0
				});

			this.getRouter().getRoute("doc").attachPatternMatched(this._onObjectMatched, this);
			// Store original busy indicator delay, so it can be restored later on
			iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
		
		   
			this.setModel(oViewModel, "docView");
			this.getOwnerComponent().oWhenMetadataIsLoaded.then(function() {
				// Restore original busy indicator delay for the object view
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
				oViewModel.setProperty("/busy", false);
				
	
			});

		},
		
/*		  onAfterRendering: function() {

//		var oView = this.getView();
//		var oObject = oView.getBindingContext().getObject();
//		var	sDoc = oObject.url;
	
var oHtml = this.getView().byId("map_iframe2");
oHtml.setContent("<iframe src="+ "http://10.126.72.12:50040" + "/google" +" height='700' width='700'></iframe>");				

   	},*/  
   	
   		onNavBack: function() {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				// The history contains a previous entry
				history.go(-1);
			} else {
				// Otherwise we go backwards with a forward history
				var bReplace = true;
				this.getRouter().navTo("object", {}, bReplace);
			}
		},
		
	
		
			/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched: function(oEvent) {
			var sObjectId = oEvent.getParameter("arguments").objectId;
			var sObjectId2 = oEvent.getParameter("arguments").objectId2;
			var sObjectId3 = oEvent.getParameter("arguments").objectId3;
			var sObjectId4 = oEvent.getParameter("arguments").objectId4;
			this.getOwnerComponent().oWhenMetadataIsLoaded.then(function() {
				var sObjectPath = this.getModel().createKey("PdfdocSet", {
					ZWfProcid: sObjectId,
					ZWfTaskid: sObjectId2,
					ZWfDocument: sObjectId3,
					ZWfTipodoc: sObjectId4
				});
				this._bindView("/" + sObjectPath );
			}.bind(this));
		
		},
		
		//Color for the tables
		
	

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound
		 * @private
		 */
		_bindView: function(sObjectPath) {
			var oViewModel = this.getModel("docView");
			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function() {
						this.getOwnerComponent().oWhenMetadataIsLoaded.then(function() {
							// Busy indicator on view should only be set if metadata is loaded,
							// otherwise there may be two busy indications next to each other on the
							// screen. This happens because route matched handler already calls '_bindView'
							// while metadata is loaded.
							oViewModel.setProperty("/busy", true);
						}
						);
					}.bind(this),
					dataReceived: function() {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},

		_onBindingChange: function() {
			var oView = this.getView(),
				oViewModel = this.getModel("docView"),
				oElementBinding = oView.getElementBinding();

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("docNotFound");
				return;

			}

			var oResourceBundle = this.getResourceBundle(),
				oObject = oView.getBindingContext().getObject(),
				sObjectId = oObject.ZWfProcid,
				sObjectId2 = oObject.ZWfTaskid,
				sObjectId3 = oObject.ZWfDocument,
				sObjectId4 = oObject.url;
				
				var height_par = isNaN(window.innerHeight)?window.clientHeight :window.innerHeight;
				
			
	            // costruisco link per doc pdf
				var oHtml = this.getView().byId("map_iframe");

               //oHtml.setContent("<iframe src="+ "http://10.126.72.12:50040" + sObjectId4  +" type='application/pdf'></iframe>");				
                oHtml.setContent("<object data="+ "http://10.126.72.12:50040" + sObjectId4  +" type='application/pdf' allowscriptaccess='always' allowfullscreen='true'><p>Please download the PDF to view it: <a href="+ "http://10.126.72.12:50040" + sObjectId4 +" target='_blank'>Download PDF</a></p></object>");				
                //window.open("http://10.126.72.12:50040" + sObjectId4, '_blank');
                
            /*var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				// The history contains a previous entry
				history.go(-1);
			} else {
				// Otherwise we go backwards with a forward history
				var bReplace = true;
				this.getRouter().navTo("object", {}, bReplace);
			}*/
                

			// Everything went fine.
			oViewModel.setProperty("/busy", false);
			oViewModel.setProperty("/saveAsTileTitle", oResourceBundle.getText("saveAsTileTitle", [sObjectId3]));
			oViewModel.setProperty("/shareOnJamTitle", sObjectId3);
			oViewModel.setProperty("/shareSendEmailSubject",
				oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			oViewModel.setProperty("/shareSendEmailMessage",
				oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectId3, sObjectId, location.href]));
		}

		
		
	});

});