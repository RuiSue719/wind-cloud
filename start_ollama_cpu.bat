@echo off
setlocal

rem Force Ollama to run in CPU mode for machines without a suitable GPU.
set OLLAMA_HOST=127.0.0.1:11434
set OLLAMA_NUM_GPU=0
set OLLAMA_NUM_THREAD=8
set OLLAMA_KEEP_ALIVE=30m
set OLLAMA_MAX_LOADED_MODELS=1
set OLLAMA_FLASH_ATTENTION=0

ollama serve
