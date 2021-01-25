
variable "aws_region" {
  default = "us-west-2"
}

variable "cluster_name" {
  default = "terraform-workflow-eks-cluster"
  type    = string
}

variable "az_count" {
  default = 2
}

data "aws_eks_cluster" "eks" {
  name = aws_eks_cluster.eks.name
}

data "aws_eks_cluster_auth" "eks" {
  name       = aws_eks_cluster.eks.name
}
