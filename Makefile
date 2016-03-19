.PHONY: build

install:
	@npm install

build: build/client.js
	@:

build/client.js: app/*.js
	npm run build-client

minify: build/client.js
	@curl -s \
		-d compilation_level=SIMPLE_OPTIMIZATIONS \
		-d output_format=text \
		-d output_info=compiled_code \
		--data-urlencode "js_code@$<" \
		http://closure-compiler.appspot.com/compile \
		> $<.tmp
	@mv $<.tmp build/client.min.js
	@gzip -c build/client.min.js > build/client.min.js.gz

dist: install build minify
