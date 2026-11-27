# AJ Wedding V10
Open index.html or publish the extracted files at GitHub Pages root.
Edit wedding-config.js for text, foreground images, music, timings, particle settings, scratch brush and component styles. Layer 1 artwork is fixed in script.js. Existing background images are unchanged.
Component styles accept CSS properties with units; advancedStyles supports additional selectors and pseudo-elements. For example, set step7.componentStyles[".lotus"] to {"left":"29%","width":"42%"}. Empty objects retain original styles. Use display:none to hide a component; hiding an interactive control can prevent its action. Do not target base artwork with advancedStyles.
TextLayout is an internal baseline, not a customization setting. Embedded artwork (including Step 3 photos and lotus flowers) remains part of the fixed background; individual embedded elements are not independently movable. R55 transition limitations are inherited.
