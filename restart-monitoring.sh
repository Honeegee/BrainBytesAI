#!/bin/bash

echo "Stopping monitoring services..."
docker-compose stop grafana prometheus alertmanager cadvisor nginx

echo "Starting monitoring services..."
docker-compose up -d grafana prometheus alertmanager cadvisor nginx

echo "Waiting for services to start..."
sleep 10

echo "Monitoring services restarted!"
echo ""
echo "Access your monitoring dashboard at:"
echo "- Main Dashboard: http://localhost:8080"
echo "- Grafana: http://localhost:8080/grafana/"
echo "- Prometheus: http://localhost:8080/prometheus/"
echo "- Alertmanager: http://localhost:8080/alertmanager/"
echo "- cAdvisor: http://localhost:8080/cadvisor/"
echo ""
echo "Grafana login: admin / brainbytes123"