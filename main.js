/**
 * An array of status effect icons which can be applied to Tokens
 * @type {Array}
 */

// Patch CombatTracker to work with token HUD overlay
Hooks.once("ready", function() {
  let newClass = CombatTracker;
  newClass = trPatchLib.patchMethod(newClass, "_onCombatantControl", 21,
    `if ( isDefeated && !token.data.overlayEffect ) token.toggleOverlay(CONFIG.controlIcons.defeated);`,
    `if ( isDefeated && token.data.overlayEffect !== CONFIG.controlIcons.defeated ) token.toggleOverlay(CONFIG.controlIcons.defeated);`);
  if (!newClass) return;
  CombatTracker.prototype._onCombatantControl = newClass.prototype._onCombatantControl;
});

// Function to use token overlay to show status as wounded, unconscious, or dead
Token.prototype._updateHealthOverlay = function(tok) {
  let maxHP = tok.actor.data.data.attributes.hp.max;
  let curHP = tok.actor.data.data.attributes.hp.value;
  let priorHealth = tok.data.overlayEffect;
  let newHealth = null;
  if ( curHP <= 0 ) {
    if ( priorHealth === "modules/conditions5e/icons/health_dead.png" ) newHealth = priorHealth;
    else newHealth = "modules/conditions5e/icons/health_dying.png";
  }
  else if ( curHP / maxHP < 0.5 ) newHealth = "modules/conditions5e/icons/health_critical.png";
  if ( newHealth !== priorHealth ) {
    if ( newHealth === null ) tok.toggleOverlay(priorHealth);
    else tok.toggleOverlay(newHealth);
  }
};

// This hook is required for Tokens NOT linked to an Actor
Hooks.on("updateToken", (scene, sceneID, update, tokenData, userId) => {
  let token = canvas.tokens.get(update._id);
  if (token.owner) token._updateHealthOverlay(token);
});

// This hook is required for Tokens linked to an Actor
Hooks.on("updateActor", (entity, updated) => {
  if (entity.owner) entity.getActiveTokens(true).map(x => x._updateHealthOverlay(x));
});
