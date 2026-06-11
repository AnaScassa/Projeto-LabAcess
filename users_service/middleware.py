class InternalRequestMiddleware:    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        host = request.META.get('HTTP_HOST', '')
        
        if host in ['users_service:8000', 'users_service', '127.0.0.1:8000']:
            request.META['HTTP_HOST'] = 'ccspc-041.ccs.unicamp.br'
        
        if '/internal/' in request.path:
            request.META['HTTP_HOST'] = 'ccspc-041.ccs.unicamp.br'
        
        response = self.get_response(request)
        return response
