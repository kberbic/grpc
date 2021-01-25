#
# VPC Resources
#  * VPC
#  * Subnets
#  * Internet Gateway
#  * Route Table
#

resource "aws_vpc" "ec2" {
  cidr_block = "10.20.0.0/16"

  tags = map(
  "Name", "test-vpc"
  )
}

resource "aws_subnet" "ec2" {
  count = 2

  availability_zone       = data.aws_availability_zones.available.names[count.index]
  cidr_block              = "10.20.${count.index}.0/24"
  map_public_ip_on_launch = true
  vpc_id                  = aws_vpc.ec2.id

  tags = map(
  "Name", "ec2-public-subnet"
  )
}

resource "aws_internet_gateway" "ec2" {
  vpc_id = aws_vpc.ec2.id

  tags = {
    Name = "ec2-igw"
  }
}

resource "aws_route_table" "ec2" {
  vpc_id = aws_vpc.ec2.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.ec2.id
  }
}

resource "aws_route_table_association" "ec2" {
  count = 2

  subnet_id      = aws_subnet.ec2.*.id[count.index]
  route_table_id = aws_route_table.ec2.id
}
