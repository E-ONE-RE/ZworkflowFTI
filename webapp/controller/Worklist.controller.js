sap.ui.define([
		"workflow/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/routing/History",
		"workflow/model/formatter",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator"
	], function (BaseController, JSONModel, History, formatter, Filter, FilterOperator) {
		"use strict";

		return BaseController.extend("workflow.controller.Worklist", {

			formatter: formatter,
			
			//Filter
		_mFilters: {
			lessUrgent: [new sap.ui.model.Filter("IconId", "EQ", 1)],
			Urgent: [new sap.ui.model.Filter("IconId", "EQ", 2)],
			moreUrgent: [new sap.ui.model.Filter("IconId", "EQ", 3)]
		},

			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */

			/**
			 * Called when the worklist controller is instantiated.
			 * @public
			 */
			onInit : function () {
				var oViewModel,
					iOriginalBusyDelay,
					oTable = this.byId("table");
					
						this._oTable = oTable;

				// Put down worklist table's original value for busy indicator delay,
				// so it can be restored later on. Busy handling on the table is
				// taken care of by the table itself.
				iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
				// keeps the search state
				this._oTableSearchState = [];

				// Model used to manipulate control states
				oViewModel = new JSONModel({
					worklistTableTitle : this.getResourceBundle().getText("worklistTableTitle"),
					saveAsTileTitle: this.getResourceBundle().getText("worklistViewTitle"),
					shareOnJamTitle: this.getResourceBundle().getText("worklistViewTitle"),
					shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
					shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
					tableNoDataText : this.getResourceBundle().getText("tableNoDataText"),
					tableBusyDelay : 0
				});
				this.setModel(oViewModel, "worklistView");

				// Make sure, busy indication is showing immediately so there is no
				// break after the busy indication for loading the view's meta data is
				// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
				oTable.attachEventOnce("updateFinished", function(){
					// Restore original busy indicator delay for worklist's table
					oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
				});
				
				/// SE refresh ogni 10 minuti tabella taskset
			setInterval(function(){
     		oTable.getBinding("items").refresh();
     		
     		 var msg = "Updating..";
        					sap.m.MessageToast.show(msg, { duration: 3000,
        					autoClose: true,
        					 closeOnBrowserNavigation: true
        					});
        					
    		},600000);
    		
			},

			/* =========================================================== */
			/* event handlers                                              */
			/* =========================================================== */

			/**
			 * Triggered by the table's 'updateFinished' event: after new table
			 * data is available, this handler method updates the table counter.
			 * This should only happen if the update was successful, which is
			 * why this handler is attached to 'updateFinished' and not to the
			 * table's list binding's 'dataReceived' method.
			 * @param {sap.ui.base.Event} oEvent the update finished event
			 * @public
			 */
			 
			 	//Quick Filter

		/** MP
		 * To refresh the binding of the table listing the tasks.
		 * If the user clicks the refresh button in the header
		 * thus action is triggered.
		 */
		onClickRefresh: function() {
			var oView = this.getView();
			var oTable = oView.byId("table");
			oTable.getBinding("items").refresh();

			var msg = "Updated";
			sap.m.MessageToast.show(msg, {
				duration: 3000, // default
				animationTimingFunction: "ease", // default
				animationDuration: 1000, // default
				closeOnBrowserNavigation: true // default
			});


		},

		onQuickFilter: function(oEvent) {
			var sKey = oEvent.getParameter("selectedKey"),
				_sKey = sKey,
				oFilter = this._mFilters[sKey],
				oBinding = this._oTable.getBinding("items");

			if (oFilter) {
				oBinding.filter(oFilter);
			} else {
				oBinding.filter([]);
			}
		},
		
			onUpdateFinished : function (oEvent) {
				// update the worklist's object counter after the table update
				var sTitle,
				oTable = oEvent.getSource(),
				oModel = this.getModel(),
				oViewModel = this.getModel("worklistView"),
				iTotalItems = oEvent.getParameter("total");
				// only update the counter if the length is final and
				// the table is not empty
			if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
				jQuery.each(this._mFilters, function(sFilterKey, oFilter) {
					oModel.read("/TaskSet/$count", {
						filters: oFilter,
						success: function(oData) {
							var sPath = "/" + sFilterKey;
							oViewModel.setProperty(sPath, oData);
						}
					});
				});
			} else {
				sTitle = this.getResourceBundle().getText("worklistTableTitle");
			}
			this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
		},

			/**
			 * Event handler when a table item gets pressed
			 * @param {sap.ui.base.Event} oEvent the table selectionChange event
			 * @public
			 */
			 
	
		
			onPress : function (oEvent) {
				// The source is the list item that got pressed
					this.showBusyIndicator(0);
				this._showObject(oEvent.getSource());
				this .hideBusyIndicator();
			},

	/**
			 * Event handler for navigating back.
			 * It there is a history entry or an previous app-to-app navigation we go one step back in the browser history
			 * If not, it will navigate to the shell home
			 * @public
			 */
		 	onNavBack: function() {
			var oHistory = sap.ui.core.routing.History.getInstance(),
				sPreviousHash = oHistory.getPreviousHash(),
				oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

			if (sPreviousHash !== undefined) {
				// The history contains a previous entry
				history.go(-1);
			} else {
				// Navigate back to FLP home
				oCrossAppNavigator.toExternal({
					target: {
						shellHash: "#"
					}
				});
			}
		},
		
		// original navback
		/* 
			onNavBack : function() {
				var sPreviousHash = History.getInstance().getPreviousHash(),
					oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

				if (sPreviousHash !== undefined || !oCrossAppNavigator.isInitialNavigation()) {
					history.go(-1);
				} else {
					oCrossAppNavigator.toExternal({
						target: {shellHash: "#Shell-home"}
					});
				}
			},
*/
		

			/**
			 * Event handler when the share in JAM button has been clicked
			 * @public
			 */
			onShareInJamPress : function () {
				var oViewModel = this.getModel("worklistView"),
					oShareDialog = sap.ui.getCore().createComponent({
						name: "sap.collaboration.components.fiori.sharing.dialog",
						settings: {
							object:{
								id: location.href,
								share: oViewModel.getProperty("/shareOnJamTitle")
							}
						}
					});
				oShareDialog.open();
			},

			onSearch : function (oEvent) {
				if (oEvent.getParameters().refreshButtonPressed) {
					// Search field's 'refresh' button has been pressed.
					// This is visible if you select any master list item.
					// In this case no new search is triggered, we only
					// refresh the list binding.
					this.onRefresh();
				} else {
					var oTableSearchState = [];
					var sQuery = oEvent.getParameter("query");

					if (sQuery && sQuery.length > 0) {
						oTableSearchState = [new Filter("ZWfProcesso", FilterOperator.Contains, sQuery)];
					}
					this._applySearch(oTableSearchState);
				}

			},


				onPullToRefresh: function() {

				var oTable = this.byId("table");
				oTable.getBinding("items").refresh();

				/*	var msg = "Updated";
					sap.m.MessageToast.show(msg, {
						duration: 1500, // default
						animationTimingFunction: "ease", // default
						animationDuration: 1000, // default
						closeOnBrowserNavigation: true // default
					});*/

				this.getView().byId("pullToRefresh").hide();
				
				var msg = "Updated";
				sap.m.MessageToast.show(msg, {
				duration: 3000, // default
				animationTimingFunction: "ease", // default
				animationDuration: 1000, // default
				closeOnBrowserNavigation: true // default
			});
			
			},
			
			
			//********* Funzioni per busyIndicator *********//
			// Funzione per nascondere il Busy Indicator
			hideBusyIndicator: function() {
				sap.ui.core.BusyIndicator.hide();
			},

			// Funzione per mostrare il busyIndicator in caricamento
			//	showBusyIndicator : function (iDuration, iDelay) {
			showBusyIndicator: function(iDelay) {
				sap.ui.core.BusyIndicator.show(iDelay);

				/*	if (iDuration && iDuration > 0) {
								if (this._sTimeoutId) {
									jQuery.sap.clearDelayedCall(this._sTimeoutId);
									this._sTimeoutId = null;
								}
				
								this._sTimeoutId = jQuery.sap.delayedCall(iDuration, this, function() {
									this.hideBusyIndicator();
								});
							}*/
			},
			//*********************************************//
			/**
			 * Event handler for refresh event. Keeps filter, sort
			 * and group settings and refreshes the list binding.
			 * @public
			 */
			onRefresh : function () {
				var oTable = this.byId("table");
				oTable.getBinding("items").refresh();
			},

			/* =========================================================== */
			/* internal methods                                            */
			/* =========================================================== */

			/**
			 * Shows the selected item on the object page
			 * On phones a additional history entry is created
			 * @param {sap.m.ObjectListItem} oItem selected Item
			 * @private
			 */
			_showObject: function(oItem) {
			this.getRouter().navTo("object", {
				objectId: oItem.getBindingContext().getProperty("ZWfProcid"),
				objectId2: oItem.getBindingContext().getProperty("ZWfTaskid")
			});
		},
		
		/**
		 * Sets the item count on the worklist view header
		 * @param {integer} iTotalItems the total number of items in the table
		 * @private
		 */
		_updateListItemCount: function(iTotalItems) {
			var sTitle;
			// only update the counter if the length is final
			if (this._oTable.getBinding("items").isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
				this.oViewModel.setProperty("/worklistTableTitle", sTitle);
			}
		},

			/**
			 * Internal helper method to apply both filter and search state together on the list binding
			 * @param {object} oTableSearchState an array of filters for the search
			 * @private
			 */
			_applySearch: function(oTableSearchState) {
				var oTable = this.byId("table"),
					oViewModel = this.getModel("worklistView");
				oTable.getBinding("items").filter(oTableSearchState, "Application");
				// changes the noDataText of the list in case there are no filter results
				if (oTableSearchState.length !== 0) {
					oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
				}
			}

		});
	}
);