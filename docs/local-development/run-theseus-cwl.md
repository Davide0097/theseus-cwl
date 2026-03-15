# Running Theseus CWL Services Locally

This guide explains how to run the Theseus CWL services locally using Docker and Kubernetes.

The services include:

- theseus-cwl-ide
- theseus-cwl-validator
- theseus-cwl-runner

Services are deployed to a local Kubernetes cluster using Docker, Kubernetes, and kind.

## Prerequisites

Make sure the following tools are installed:

- Docker
- kubectl
- kind

You must also have a running kind cluster:

```bash
kind create cluster --name theseus-cluster
```

## Port Mapping

| Service               | Dev Port | Docker/K8s Port |
| --------------------- | -------- | --------------- |
| theseus-cwl-ide       | 3002     | 3002            |
| theseus-cwl-validator | 3003     | 3003            |
| theseus-cwl-runner    | 3004     | 3004            |
| landing page          | 3011     | —               |
| test                  | 3010     | —               |

## Run `theseus-cwl-ide`

### Build the Docker image

From the repository root:

```bash
docker build -f apps/theseus-cwl-ide/Dockerfile -t theseus-cwl-ide:local .
```

### Verify the image exists

```bash
docker images
```

You should see:

```bash
theseus-cwl-ide   local
```

### Load the image into the kind

```bash
kind load docker-image theseus-cwl-ide:local --name theseus-cluster
```

### Apply Kubernetes configuration

Navigate to `theseus-cwl/theseus-cwl/k8/theseus-cwl-ide`

Then apply the deployment:

```bash
kubectl apply -f k8.yaml
```

### Verify the pod

```bash
kubectl get pods
```

If needed, restart the deployment:

```bash
kubectl rollout restart deployment/theseus-cwl-ide
```

### Port forward the service

```bash
kubectl port-forward service/theseus-cwl-ide-service 3002:3002
```

The service will now be available at <http://localhost:3002>

## Run `theseus-cwl-validator`

### Build the Docker image

From the repository root:

```bash
docker build -f apps/theseus-cwl-validator/Dockerfile -t theseus-cwl-validator:local .
```

### Verify the image exists

```bash
docker images
```

You should see:

```bash
theseus-cwl-validator   local
```

### Load the image into the kind

```bash
kind load docker-image theseus-cwl-validator:local --name theseus-cluster
```

### Apply Kubernetes configuration

Navigate to `theseus-cwl/theseus-cwl/k8/theseus-cwl-validator`

Then apply the deployment:

```bash
kubectl apply -f k8.yaml
```

### Verify the pod

```bash
kubectl get pods
```

If needed, restart the deployment:

```bash
kubectl rollout restart deployment/theseus-cwl-validator
```

### Port forward the service

```bash
kubectl port-forward service/theseus-cwl-validator-service 3003:3003
```

The service will now be available at <http://localhost:3003>

## Run `theseus-cwl-runner`

### Build the Docker image

From the repository root:

```bash
docker build -f apps/theseus-cwl-runner/Dockerfile -t theseus-cwl-runner:local .
```

### Verify the image exists

```bash
docker images
```

You should see:

```bash
theseus-cwl-runner   local
```

### Load the image into the kind

```bash
kind load docker-image theseus-cwl-runner:local --name theseus-cluster
```

### Apply Kubernetes configuration

Navigate to `theseus-cwl/theseus-cwl/k8/theseus-cwl-runner`

Then apply the deployment:

```bash
kubectl apply -f k8.yaml
```

### Verify the pod

```bash
kubectl get pods
```

If needed, restart the deployment:

```bash
kubectl rollout restart deployment/theseus-cwl-runner
```

### Port forward the service

```bash
kubectl port-forward service/theseus-cwl-runner-service 3004:3004
```

The service will now be available at <http://localhost:3004>
