pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/devops-qamar/smartshop-lite.git'
            }
        }

        stage('Docker Test') {
            steps {
                sh 'docker --version'
            }
        }

        stage('Build Backend') {
            steps {
                sh 'docker build -t qamardev/smartshop-backend:latest ./backend'
            }
        }

        stage('Build Frontend') {
            steps {
                sh 'docker build -t qamardev/smartshop-frontend:latest ./frontend'
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {
                    sh '''
                        echo "$DOCKER_PASSWORD" | docker login \
                        -u "$DOCKER_USERNAME" \
                        --password-stdin
                    '''
                }
            }
        }

        stage('Push Images') {
            steps {
                sh 'docker push qamardev/smartshop-backend:latest'
                sh 'docker push qamardev/smartshop-frontend:latest'
            }
        }
    }
}
