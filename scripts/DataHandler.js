var DataHandler = (function (ns) {

  /**
  * @param {string} id the id of the file to get the content from
  * @return {object}
  */
  ns.getContent = function (id) {
    var file = cUseful.Utils.expBackoff (function () {
      return DriveApp.getFileById(id);
    });
    
    if (!file) {
      return {success:false, id:id , message:"file did not exist"};
    }
    else {
      var obs = cUseful.Utils.expBackoff( function () {
        return file.getBlob().getDataAsString();
      });
      
      try {
        var ob = JSON.parse(obs);
        return {success:true, id:id , content:ob};
      }
      catch (err) {
        return {success:false, id:id , message:err,content:obs};
      }
    }
  };
  
  /**
  * @param {object} params the paramter object from doGet
  * @param {object} status the file contents status
  * @return {object} status the updated status
  */
  ns.getData = function (params, status) {
  
    if (status.success) {
      // first option is to use the data vanilla
      if (!params.parameters.live) {
        status.values = status.content.values;
      }
      else {
        try {
          // need to access the data directly 
          var ss = SpreadsheetApp.openById(status.content.id);
          var sheet = ss.getSheetByName(status.content.sheet);
          var range = status.content.range ? sheet.getDataRange() : sheet.getRange(status.content.range);
          status.content.values = cUseful.Utils.expBackoff(function() {
            return range.getValues();
          });
        }
        catch(err) {
          status.success = false;
          status.message = err;
        }
      }
      return status;
    }
  }
  return ns;
}) (DataHandler || {});
