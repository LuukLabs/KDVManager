﻿using System;
using MediatR;

namespace KDVManager.Services.CRM.Application.Features.Children.Commands.DeleteChild;

public class DeleteChildCommand : IRequest
{
    public Guid Id { get; set; }
}
