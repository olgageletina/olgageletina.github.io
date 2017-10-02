source 'https://rubygems.org'

require 'json'
require 'open-uri'
versions = JSON.parse(open('https://pages.github.com/versions.json').read)

gem 'jekyll'

gem 'github-pages', versions['github-pages']

group :jekyll_plugins do
	gem 'jekyll-feed'
	# gem 'jekyll-compass'
end



