/**
 * Designed for CodeTenderloin (http://www.codetenderloin.com).
 * Script to translate a form into a SQL insert statement.

 * The code for Form submission triggering and add-on configuration is adapted from
 * https://github.com/googlesamples/apps-script-form-notifications-addon

 * TODO(peskoj): Implement function insertToDatabase that executes SQL insert command. 
 * TODO(peskoj): Add code to create mapping of field names to database ids in the config bar.
 */

var ADDON_TITLE = 'CodeTenderloin';

/**
 * Runs when the form is opened. Creates an add-on menu.
 *
 * @param {object} e The event parameter for a simple onInstall trigger.
 */
function onOpen(e) {
  FormApp.getUi()
      .createAddonMenu()
      .addItem('Configure Add-On', 'showConfiguration')
      .addToUi();
}

/**
 * Runs when the add-on is installed.
 *
 * @param {object} e The event parameter for a simple onInstall trigger.
 */
function onInstall(e) {
  onOpen(e);
}

/**
 * Shows configuration panel.
 */
function showConfiguration() {
  var ui = HtmlService.createHtmlOutputFromFile('Configuration')
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)
      .setTitle('Configuration');
  FormApp.getUi().showSidebar(ui);
}

/**
 * Saves custom settings as part of the form.
 */
function saveSettings(settings) {
  PropertiesService.getDocumentProperties().setProperties(settings);
  adjustFormSubmitTrigger();
}

/**
 * Reads settings stored with the form.
 */
function getSettings() {
  var settings = PropertiesService.getDocumentProperties().getProperties();

  // Use a default email if the creator email hasn't been provided yet.
  if (!settings.creatorEmail) {
    settings.creatorEmail = Session.getEffectiveUser().getEmail();
  }

  // Get text field items in the form and compile a list
  //   of their titles and IDs.
  var form = FormApp.getActiveForm();
  var textItems = form.getItems(FormApp.ItemType.TEXT);
  settings.textItems = [];
  for (var i = 0; i < textItems.length; i++) {
    settings.textItems.push({
      title: textItems[i].getTitle(),
      id: textItems[i].getId()
    });
  }
  return settings;
}

/**
 * Sets a on-submit trigger that gets executed every time a form is submitted.
 */
function adjustFormSubmitTrigger() {
  var form = FormApp.getActiveForm();

  ScriptApp.newTrigger('respondToFormSubmit')
      .forForm(form)
      .onFormSubmit()
      .create();
}

/**
 * A trigger that gets executed every time a form is submitted.
 */
function respondToFormSubmit(e) {
  var settings = PropertiesService.getDocumentProperties();
  var authInfo = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);

  // Check if the actions of the trigger require authorizations that have not
  // been supplied yet -- if so, warn the active user via email (if possible).
  // This check is required when using triggers with add-ons to maintain
  // functional triggers.
  if (authInfo.getAuthorizationStatus() ==
      ScriptApp.AuthorizationStatus.REQUIRED) {
    // Re-authorization is required. In this case, the user needs to be alerted
    // that they need to reauthorize; the normal trigger action is not
    // conducted, since it authorization needs to be provided first. Send at
    // most one 'Authorization Required' email a day, to avoid spamming users
    // of the add-on.
    sendReauthorizationRequest();
  } else {
    // All required authorizations has been granted, so continue to respond to
    // the trigger event.

    // Make insert call to database.
    insertToDatabase(e);
  }
}

/**
 * Inserts new entry to a database specified in the form settings.
 * TODO(peskoj): Implement this function. 
 */
function insertToDatabase(e) {
  var form = FormApp.getActiveForm();
  var settings = PropertiesService.getDocumentProperties();
  
  Logger.log(settings.getProperty('server'));
  Logger.log(settings.getProperty('database'));
  Logger.log(settings.getProperty('username'));
  Logger.log(settings.getProperty('password'));

  var itemResponses = e.response.getItemResponses();
  for (var j = 0; j < itemResponses.length; j++) {
    var itemResponse = itemResponses[j];
    Logger.log('Response to the question "%s" was "%s"',
        itemResponse.getItem().getTitle(),
        itemResponse.getResponse());
  }  
}  

/**
 * Sends an email to the admin to reauthorize the script when it changes.
 * Run the script after making changes to avoid this.
 */
function sendReauthorizationRequest() {
  var settings = PropertiesService.getDocumentProperties();
  var authInfo = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
  var lastAuthEmailDate = settings.getProperty('lastAuthEmailDate');
  var today = new Date().toDateString();
  if (lastAuthEmailDate != today) {
    if (MailApp.getRemainingDailyQuota() > 0) {
      var template =
          HtmlService.createTemplateFromFile('AuthorizationEmail');
      template.url = authInfo.getAuthorizationUrl();
      template.name = ADDON_TITLE;
      var message = template.evaluate();
      MailApp.sendEmail(Session.getEffectiveUser().getEmail(),
          'Authorization Required',
          message.getContent(), {
            name: ADDON_TITLE,
            htmlBody: message.getContent()
          });
    }
    settings.setProperty('lastAuthEmailDate', today);
  }
}
