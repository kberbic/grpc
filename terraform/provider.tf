terraform {
  required_version = ">= 0.12"
}

provider "aws" {
  region     = ""
  access_key = ""
  secret_key = ""
}

data "aws_availability_zones" "available" {}

data "aws_vpc" "ec2" {

}

data "aws_subnet_ids" "ec2" {
  vpc_id = var.vpc_id
}

data "aws_subnet" "ec2" {
  for_each = data.aws_subnet_ids.ec2.ids
  id       = each.value
}
