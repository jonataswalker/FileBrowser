LAST_VERSION	:= $(shell node -p "require('./package.json').version")
NOW		:= $(shell date --iso=seconds)
ROOT_DIR	:= $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
SRC_DIR 	:= $(ROOT_DIR)/src
BUILD_DIR 	:= $(ROOT_DIR)/build
EXTERNS_DIR 	:= $(ROOT_DIR)/externs
JS_DEBUG 	:= $(BUILD_DIR)/filebrowser-debug.js
JS_FINAL 	:= $(BUILD_DIR)/filebrowser.js
CSS_COMBINED 	:= $(BUILD_DIR)/filebrowser.css
CSS_FINAL 	:= $(BUILD_DIR)/filebrowser.min.css
TMPFILE 	:= $(BUILD_DIR)/tmp

JS_FILES 	:= $(SRC_DIR)/wrapper-head.js \
		   $(SRC_DIR)/utils.js \
		   $(SRC_DIR)/base.js \
		   $(SRC_DIR)/tree.js \
		   $(SRC_DIR)/html.js \
		   $(SRC_DIR)/drag.js \
		   $(SRC_DIR)/upload.js \
		   $(SRC_DIR)/alert.js \
		   $(SRC_DIR)/wrapper-tail.js \
		   $(EXTERNS_DIR)/canvas-to-blob.js \
		   $(EXTERNS_DIR)/FileAPI.core.js \
		   $(EXTERNS_DIR)/FileAPI.Image.js \
		   $(EXTERNS_DIR)/FileAPI.Form.js \
		   $(EXTERNS_DIR)/FileAPI.XHR.js \
		   $(EXTERNS_DIR)/FileAPI.Flash.js

CSS_FILES 	:= $(SRC_DIR)/filebrowser.css \
		   $(SRC_DIR)/brankic-icomoon.css

NODE_MODULES	:= ./node_modules/.bin
CLEANCSS 	:= $(NODE_MODULES)/cleancss
CLEANCSSFLAGS 	:= --skip-restructuring
POSTCSS 	:= $(NODE_MODULES)/postcss
POSTCSSFLAGS 	:= --use autoprefixer -b "last 2 versions"
ESLINT 		:= $(NODE_MODULES)/eslint
UGLIFYJS 	:= $(NODE_MODULES)/uglifyjs
UGLIFYJSFLAGS 	:= --mangle --mangle-regex --screw-ie8 -c warnings=false
JS_BEAUTIFY	:= $(NODE_MODULES)/js-beautify
BEAUTIFYFLAGS 	:= -f - --indent-size 2 --preserve-newlines
NODEMON 	:= $(NODE_MODULES)/nodemon
PARALLELSHELL 	:= $(NODE_MODULES)/parallelshell

# just to create variables like NODEMON_JS_FLAGS when called
define NodemonFlags
	UP_LANG = $(shell echo $(1) | tr '[:lower:]' '[:upper:]')
	NODEMON_$$(UP_LANG)_FLAGS := --on-change-only --watch "$(SRC_DIR)" --ext "$(1)" --exec "make build-$(1)"
endef

define HEADER
// A multi-purpose filebrowser.
// https://github.com/jonataswalker/FileBrowser
// Version: v$(LAST_VERSION)
// Built: $(NOW)

endef
export HEADER

# targets
.PHONY: ci
ci: build

build-watch: build watch

watch:
	$(PARALLELSHELL) "make watch-js" "make watch-css"

build: build-js build-css

build-js: combine-js lint uglifyjs addheader
	@echo `date +'%H:%M:%S'` " - build JS ... OK"

build-css: combine-css cleancss
	@echo `date +'%H:%M:%S'` " - build CSS ... OK"

uglifyjs:
	@$(UGLIFYJS) $(JS_DEBUG) $(UGLIFYJSFLAGS) > $(JS_FINAL)

lint:
	@$(ESLINT) $(JS_DEBUG)

addheader-debug:
	@echo "$$HEADER" | cat - $(JS_DEBUG) > $(TMPFILE) && mv $(TMPFILE) $(JS_DEBUG)

addheader-min:
	@echo "$$HEADER" | cat - $(JS_FINAL) > $(TMPFILE) && mv $(TMPFILE) $(JS_FINAL)

addheader: addheader-debug addheader-min

cleancss:
	@cat $(CSS_COMBINED) | $(CLEANCSS) $(CLEANCSSFLAGS) > $(CSS_FINAL)

combine-js:
	@cat $(JS_FILES) | $(JS_BEAUTIFY) $(BEAUTIFYFLAGS) > $(JS_DEBUG)

combine-css:
	@cat $(CSS_FILES) | $(POSTCSS) $(POSTCSSFLAGS) > $(CSS_COMBINED)

watch-js: $(JS_FILES)
	$(eval $(call NodemonFlags,js))
	@$(NODEMON) $(NODEMON_JS_FLAGS)

watch-css: $(CSS_FILES)
	$(eval $(call NodemonFlags,css))
	@$(NODEMON) $(NODEMON_CSS_FLAGS)
	
.DEFAULT_GOAL := build
