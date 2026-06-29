pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Code checked out from GitHub!'
            }
        }
        
        stage('Build Backend') {
            steps {
                echo 'Building Backend...'
                dir('finflow-backend') {
                    bat 'npm install'
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                echo 'Building Frontend...'
                dir('finflow-frontend') {
                    bat 'npm install --legacy-peer-deps'
                }
            }
        }
        
        stage('Docker Deploy') {
            steps {
                echo 'Deploying with Docker...'
                bat 'docker-compose restart'
            }
        }
    }
}