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
                        credentialsId: 'dockerhub-credentials',
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

        stage('Deploy to EC2') {
            steps {
                withCredentials([
                    sshUserPrivateKey(
                        credentialsId: 'ec2-ssh',
                        keyFileVariable: 'SSH_KEY',
                        usernameVariable: 'SSH_USER'
                    )
                ]) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no \
                            -i "$SSH_KEY" \
                            "$SSH_USER"@43.204.147.161 << 'EOF'

                        set -e

                        echo "=== Pulling latest images ==="

                        docker pull qamardev/smartshop-backend:latest
                        docker pull qamardev/smartshop-frontend:latest

                        echo "=== Stopping old containers ==="

                        docker stop smartshop-backend 2>/dev/null || true
                        docker stop smartshop-frontend 2>/dev/null || true

                        echo "=== Removing old containers ==="

                        docker rm smartshop-backend 2>/dev/null || true
                        docker rm smartshop-frontend 2>/dev/null || true

                        echo "=== Starting backend ==="

                        docker run -d \
                            --name smartshop-backend \
                            -p 5000:5000 \
                            qamardev/smartshop-backend:latest

                        echo "=== Starting frontend ==="

                        docker run -d \
                            --name smartshop-frontend \
                            -p 8081:80 \
                            qamardev/smartshop-frontend:latest

                        echo "=== Running containers ==="

                        docker ps

                        echo "=== Deployment completed successfully ==="

                        EOF
                    '''
                }
            }
        }
    }
}
