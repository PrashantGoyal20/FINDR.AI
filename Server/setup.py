from setuptools import setup,find_packages
from typing import List

HYPHEN_E_DOT='-e .'

def get_requiremnets(filename : str)->List[str]:
    requirements = []
    with open(filename,'r') as f:
        requirements=f.readlines()
        requirements = [req.replace('\n','') for req in requirements]

        if HYPHEN_E_DOT in requirements:
            requirements.remove(HYPHEN_E_DOT)

    return requirements        

setup (
    name = "FINDR",
    version = "0.0.1",
    packages = find_packages(),
    author = "Prashant",
    author_email = "prashant.goyal2002@gmail.com",
    description = "a simple project to predict performance of student",
    install_requires = get_requiremnets('requirements.txt')
)