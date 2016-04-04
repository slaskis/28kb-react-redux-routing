.PHONY: build

install:
	@npm install

build: build/client.js
	@:

build/client.js: app/*.js
	npm run build-client

minify: build/client.min.js.gz
	@:

build/%.min.js: build/%.js
	@curl -s \
		-d compilation_level=SIMPLE_OPTIMIZATIONS \
		-d output_format=text \
		-d output_info=compiled_code \
		--data-urlencode "js_code@$<" \
		http://closure-compiler.appspot.com/compile \
		> $<.tmp
	@mv $<.tmp $@

build/%.min.js.gz: build/%.min.js
	@gzip -c $< > $@


dist: install build minify
