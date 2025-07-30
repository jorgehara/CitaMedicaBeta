#!/bin/bash
while true; do
    docker cp chatbot:/app/bot.qr.png /usr/share/nginx/qr/bot.qr.png
    sleep 30
done
