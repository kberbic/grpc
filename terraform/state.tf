terraform {
  backend "s3" {
    # Replace this with your bucket name!
    encrypt = true
    bucket = "terraform"
    region = "us-west-2"
    key = "terraform/terraform.tfstate"
  }
#}
