#!/bin/bash

pandoc \
  --to=beamer \
  --output=$2 \
  -f "markdown_strict+pipe_tables+backtick_code_blocks+auto_identifiers+strikeout+yaml_metadata_block+implicit_figures+all_symbols_escapable+link_attributes+smart+fenced_divs" \
  --slide-level 3  $1 
