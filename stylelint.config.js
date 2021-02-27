module.exports = {
	fix : true,
	extends: ["stylelint-config-standard", "stylelint-config-sass-guidelines", "stylelint-config-idiomatic-order"],
	plugins: [
		"stylelint-order",
		"stylelint-scss",
	],
	rules : {
		"indentation": [
			4,
			{
			  "message": "Please use 4 spaces for indentation.",
			  "severity": "error"
			}
		],
		"max-empty-lines" : 1,
		"max-nesting-depth" : 3,

		"order/properties-alphabetical-order": null
	}
}