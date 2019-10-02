sap.ui.define([
		"sap/ui/model/json/JSONModel",
		"sap/ui/Device"
//	"sap/ui/model/odata/v2/ODataModel",
//	"sap/ui/model/resource/ResourceModel"
//], function(JSONModel, Device, ODataModel, ResourceModel) {
], function(JSONModel, Device) {
	"use strict";

		return {

			createDeviceModel : function () {
				var oModel = new JSONModel(Device);
				oModel.setDefaultBindingMode("TwoWay");
				return oModel;
			},

			createFLPModel : function () {
				var fnGetUser = jQuery.sap.getObject("sap.ushell.Container.getUser"),
					bIsShareInJamActive = fnGetUser ? fnGetUser().isJamActive() : false,
					oModel = new JSONModel({
						isShareInJamActive: bIsShareInJamActive
					});
				oModel.setDefaultBindingMode("TwoWay");
				return oModel;
			}

		};

	}
);