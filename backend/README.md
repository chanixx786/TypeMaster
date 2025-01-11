pip uninstall torch torchvision transformers flask-cors flask

uninstall this first then proceed to install the libraries and packages below:

pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
pip install transformers==4.34.0 --no-deps
pip install flask flask-cors --no-cache-dir
pip install "tokenizers>=0.14,<0.15"
